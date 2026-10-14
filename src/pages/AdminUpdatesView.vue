<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { isSuperuser } from '@/utils/menupanel';
import { isLoggedIn } from '@/utils/user';
import {
	clearUpdateSettings,
	fetchLatestUpdate,
	getUpdateSettings,
	saveUpdateSettings,
	type UpdateAnnouncement,
	type UpdateButton,
} from '@/utils/updates';
import { showToast } from '@/components/ToastComponent.vue';

const router = useRouter();
const loading = ref(true);
const allowed = ref(false);
const title = ref('');
const content = ref('');
const buttons = ref<UpdateButton[]>([]);
const current = ref<UpdateAnnouncement | null>(null);
const currentUpdateId = ref<number | null>(null);
const saving = ref(false);
const clearing = ref(false);

function toRows(announcement: UpdateAnnouncement | null) {
	current.value = announcement;
	currentUpdateId.value = announcement?.update_id ?? null;
	title.value = announcement?.title ?? '';
	content.value = announcement?.content ?? '';
	buttons.value = (announcement?.buttons ?? []).map(button => ({ label: button.label, text: button.text }));
}

function addButton() {
	if (buttons.value.length >= 8) {
		showToast('最多 8 个按钮', 'warning');
		return;
	}
	buttons.value.push({ label: '', text: '' });
}

function removeButton(index: number) {
	buttons.value.splice(index, 1);
}

async function save() {
	if (!title.value.trim() || !content.value.trim()) {
		showToast('标题和正文不能为空', 'warning');
		return;
	}
	if (buttons.value.some(button => !button.label.trim() || !button.text.trim())) {
		showToast('按钮的名称和指令都不能为空', 'warning');
		return;
	}
	saving.value = true;
	try {
		const updateId = await saveUpdateSettings({
			title: title.value.trim(),
			content: content.value,
			buttons: buttons.value,
		});
		currentUpdateId.value = updateId;
		showToast(`已发布（版本 ${ updateId }），用户将收到新的更新提醒`, 'success');
		await reloadLatest();
	} catch (e) {
		showToast(e instanceof Error ? e.message : String(e), 'error');
	} finally {
		saving.value = false;
	}
}

async function clearAnnouncement() {
	clearing.value = true;
	try {
		await clearUpdateSettings();
		showToast('已清除当前更新公告', 'success');
		await reloadLatest();
	} catch (e) {
		showToast(e instanceof Error ? e.message : String(e), 'error');
	} finally {
		clearing.value = false;
	}
}

async function reloadLatest() {
	try {
		// 保存后立即拉最新（force 绕过缓存），保证卡片与设置表单一致
		toRows(await fetchLatestUpdate({ force: true }));
	} catch {
		// 网页端 API 与本页同源，偶发失败时保留当前表单内容即可
	}
}

onMounted(async () => {
	if (!await isLoggedIn()) await router.push('/login?redirect=/admin/updates');
	if (!await isSuperuser()) {
		allowed.value = false;
		loading.value = false;
		return;
	}
	allowed.value = true;
	try {
		toRows(await getUpdateSettings());
	} catch (e) {
		showToast(e instanceof Error ? e.message : String(e), 'error');
	} finally {
		loading.value = false;
	}
});

function formatTime(time: number): string {
	return new Date(time * 1000).toLocaleString();
}
</script>

<template>
	<h1>更新公告管理</h1>
	<p v-if="loading">正在加载……</p>
	<p v-else-if="!allowed">无权访问此页面。</p>
	<template v-else>
		<mdui-card variant="outlined" class="panel-card">
			<div class="panel-content">
				<h2>最新更新公告</h2>
				<p>公告正文使用 Markdown，可附带按钮；每次保存都会生成新版本号并触发用户端更新提醒。</p>
				<mdui-text-field
					variant="outlined"
					label="标题"
					:value="title"
					@input="title = ($event.target as HTMLInputElement).value"
					maxlength="64"
					clearable
				></mdui-text-field>
				<mdui-text-field
					variant="outlined"
					class="content-field"
					autosize
					:min-rows="6"
					:max-rows="20"
					label="正文 (Markdown)"
					:value="content"
					@input="content = ($event.target as HTMLInputElement).value"
				></mdui-text-field>

				<h3>按钮（可选）</h3>
				<p class="hint">按钮点击后会把「指令」原文发回聊天窗口，填完整指令（含前缀，如 /updates）。</p>
				<div v-for="(button, index) of buttons" v-bind:key="index" class="button-row">
					<mdui-text-field
						variant="outlined"
						label="名称"
						:value="button.label"
						@input="button.label = ($event.target as HTMLInputElement).value"
					></mdui-text-field>
					<mdui-text-field
						variant="outlined"
						label="指令"
						:value="button.text"
						@input="button.text = ($event.target as HTMLInputElement).value"
					></mdui-text-field>
					<mdui-button-icon icon="delete" variant="standard" @click="removeButton(index)"
									aria-label="删除按钮"></mdui-button-icon>
				</div>
				<mdui-button icon="add" variant="text" @click="addButton">添加按钮</mdui-button>

				<p></p>
				<mdui-button icon="publish" :disabled="saving" @click="save">发布公告</mdui-button>
				&nbsp;
				<mdui-button icon="delete_forever" variant="outlined" :disabled="clearing" @click="clearAnnouncement">
					清除公告
				</mdui-button>
				<p v-if="current && currentUpdateId !== null" class="hint">
					当前生效：版本 {{ currentUpdateId }} · {{ formatTime(current.time) }} · {{ current.title }}
				</p>
				<p v-else class="hint">当前没有生效的更新公告。</p>
			</div>
		</mdui-card>
	</template>
</template>

<style scoped lang="scss">
.panel-card {
	width: 67%;
	margin-bottom: 16px;
}

.panel-content {
	padding: 4px 20px 12px;
}

.content-field {
	width: 100%;
	margin-top: 8px;
}

.button-row {
	display: grid;
	grid-template-columns: 1fr 1fr auto;
	gap: 8px;
	align-items: center;
	width: 100%;
	max-width: 640px;
}

.hint {
	color: rgb(var(--mdui-color-on-surface-variant));
	font-size: 14px;
}

mdui-text-field:not(.content-field) {
	margin-top: 8px;
}

@media (max-width: 767px) {
	.panel-card {
		width: 100%;
	}
}
</style>
