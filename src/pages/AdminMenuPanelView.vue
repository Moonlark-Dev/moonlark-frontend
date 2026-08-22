<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
	fetchHelpList,
	getMenuPanelSettings,
	isSuperuser,
	saveMenuPanelSettings,
	syncMenuPanel,
	type HelpCategory,
	type SyncResponse
} from '@/utils/menupanel';
import { isLoggedIn } from '@/utils/user';

const MAX_COMMANDS = 8;

const router = useRouter();
const loading = ref(true);
const allowed = ref(false);
const categories = ref<HelpCategory[]>();
const selected = ref<string[]>([]);
const saving = ref(false);
const syncing = ref(false);
const message = ref('');
const lastSync = ref<SyncResponse>();

const selectedCount = computed(() => selected.value.length);

function isSelected(commandName: string): boolean {
	return selected.value.includes(commandName);
}

function toggle(commandName: string) {
	if (isSelected(commandName)) {
		selected.value = selected.value.filter(name => name !== commandName);
	} else if (selected.value.length < MAX_COMMANDS) {
		selected.value.push(commandName);
	} else {
		message.value = `最多选择 ${ MAX_COMMANDS } 个指令`;
	}
}

async function save() {
	saving.value = true;
	message.value = '';
	try {
		await saveMenuPanelSettings(selected.value);
		message.value = '配置已保存';
	} catch (e) {
		message.value = e instanceof Error ? e.message : String(e);
	} finally {
		saving.value = false;
	}
}

async function sync() {
	syncing.value = true;
	message.value = '';
	try {
		lastSync.value = await syncMenuPanel();
		message.value = lastSync.value.success ? '同步完成' : '同步完成，但部分 bot 失败';
	} catch (e) {
		message.value = e instanceof Error ? e.message : String(e);
	} finally {
		syncing.value = false;
	}
}

onMounted(async () => {
	if (!await isLoggedIn()) await router.push('/login?redirect=/admin/menupanel');
	if (!await isSuperuser()) {
		allowed.value = false;
		loading.value = false;
		return;
	}
	allowed.value = true;
	try {
		const [helpList, settings] = [await fetchHelpList(), await getMenuPanelSettings()];
		categories.value = helpList;
		selected.value = settings.commands.filter(name =>
			helpList.some(category => category.commands.some(command => command.name === name))
		);
	} catch (e) {
		message.value = e instanceof Error ? e.message : String(e);
	} finally {
		loading.value = false;
	}
});

</script>

<template>
	<h1>超级管理员面板</h1>
	<p v-if="loading">正在加载……</p>
	<p v-else-if="!allowed">无权访问此页面。</p>
	<template v-else>
		<mdui-card variant="outlined" class="panel-card">
			<div class="panel-content">
				<h2>QQ 菜单/指令面板展示指令</h2>
				<p>已选 {{ selectedCount }} / {{ MAX_COMMANDS }} 个指令。保存后点击「同步到 QQ」生效：
					所选指令会作为单聊自定义菜单按钮与单聊/群聊指令面板元素下发，
					菜单固定附带「帮助」与「在线帮助」两项。</p>
				<mdui-card v-for="category of categories" v-bind:key="category.name" variant="outlined"
						   class="category-card">
					<div class="category-content">
						<h3>{{ category.name }}</h3>
						<div class="command-list">
							<mdui-checkbox v-for="command of category.commands" v-bind:key="command.name"
										   :checked="isSelected(command.name)"
										   @click.prevent="toggle(command.name)">
								{{ command.name }} —— {{ command.description }}
							</mdui-checkbox>
						</div>
					</div>
				</mdui-card>
				<p></p>
				<mdui-button icon="save" :disabled="saving" @click="save">保存配置</mdui-button>
				&nbsp;
				<mdui-button icon="cloud_upload" :disabled="syncing" @click="sync">同步到 QQ</mdui-button>
				<p v-if="message">{{ message }}</p>
				<template v-if="lastSync">
					<mdui-list-item v-for="result of lastSync.results" v-bind:key="result.self_id" nonclickable
									:icon="result.success ? 'check_circle' : 'error'">
						Bot {{ result.self_id }}：{{ result.message || (result.success ? '成功' : '失败') }}
					</mdui-list-item>
				</template>
			</div>
		</mdui-card>
	</template>
</template>

<style scoped lang="scss">
.panel-card, .category-card {
	width: 67%;
	margin-bottom: 16px;
}

.panel-content, .category-content {
	padding: 4px 20px 12px;
}

.command-list {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

@media (max-width: 767px) {
	.panel-card, .category-card {
		width: 100%;
	}
}
</style>
