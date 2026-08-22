<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchHelpList, type CommandInfo, type HelpCategory } from '@/utils/menupanel';

const categories = ref<HelpCategory[]>();
const error = ref('');
const keyword = ref('');
const selectedCommand = ref<CommandInfo | null>(null);
const dialogOpen = ref(false);

onMounted(async () => {
	try {
		categories.value = await fetchHelpList();
	} catch (e) {
		error.value = e instanceof Error ? e.message : String(e);
	}
});

/// 按关键字过滤指令（匹配指令名、简介或分类名），并隐藏过滤后没有指令的分类
const filteredCategories = computed<HelpCategory[]>(() => {
	if (!categories.value) return [];
	const kw = keyword.value.trim().toLowerCase();
	if (!kw) return categories.value;
	return categories.value
		.map((category) => ({
			name: category.name,
			commands: category.commands.filter((command) =>
				command.name.toLowerCase().includes(kw)
				|| command.description.toLowerCase().includes(kw)
				|| command.category.toLowerCase().includes(kw)),
		}))
		.filter((category) => category.commands.length > 0);
});

function openCommand(command: CommandInfo) {
	selectedCommand.value = command;
	dialogOpen.value = true;
}
</script>

<template>
	<h1>Moonlark 指令帮助</h1>
	<p v-if="error">帮助数据加载失败：{{ error }}</p>
	<p v-else-if="!categories">正在加载……</p>
	<template v-else>
		<mdui-text-field
			class="search-box"
			variant="outlined"
			label="搜索指令"
			placeholder="输入名称、简介或分类进行筛选…"
			clearable
			:value="keyword"
			@input="keyword = ($event.target as HTMLInputElement).value"
		></mdui-text-field>

		<p v-if="filteredCategories.length === 0" class="empty-hint">没有找到与「{{ keyword.trim() }}」相关的指令。</p>

		<section v-for="category of filteredCategories" v-bind:key="category.name" class="category-section">
			<h2>{{ category.name }}</h2>
			<div class="command-grid">
				<mdui-card
					v-for="command of category.commands"
					v-bind:key="command.name"
					variant="outlined"
					clickable
					class="command-card"
					role="button"
					tabindex="0"
					@click="openCommand(command)"
					@keydown.enter.prevent="openCommand(command)"
				>
					<div class="card-body">
						<h3 class="command-name">{{ command.name }}</h3>
						<p class="command-description">{{ command.description }}</p>
						<p class="command-details">{{ command.details }}</p>
						<div class="command-labels">
							<mdui-chip>{{ command.category }}</mdui-chip>
							<mdui-chip>{{ command.usages.length }} 种用法</mdui-chip>
						</div>
					</div>
				</mdui-card>
			</div>
		</section>
	</template>

	<mdui-dialog
		class="command-dialog"
		:headline="selectedCommand?.name"
		:description="selectedCommand?.description"
		:open="dialogOpen"
		close-on-overlay-click
		close-on-esc
		@close="dialogOpen = false"
	>
		<div v-if="selectedCommand" class="dialog-body">
			<h3>详细介绍</h3>
			<p class="dialog-details">{{ selectedCommand.details }}</p>
			<h3>用法（{{ selectedCommand.usages.length }}）</h3>
			<p v-for="usage of selectedCommand.usages" v-bind:key="usage" class="usage">{{ usage }}</p>
		</div>
		<mdui-button slot="action" variant="text" @click="dialogOpen = false">关闭</mdui-button>
	</mdui-dialog>
</template>

<style scoped lang="scss">
.search-box {
	width: 67%;
	margin-bottom: 8px;
}

.empty-hint {
	color: rgb(var(--mdui-color-on-surface-variant));
}

.command-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	gap: 12px;
	padding-bottom: 16px;
}

.command-card {
	display: flex;

	&:focus-visible {
		outline: 2px solid rgb(var(--mdui-color-primary));
		outline-offset: 2px;
	}
}

.card-body {
	display: flex;
	flex-direction: column;
	width: 100%;
	box-sizing: border-box;
	padding: 14px 16px 12px;
}

.command-name {
	margin: 0 0 4px;
	font-family: monospace;
	font-size: 1.08em;
	font-weight: 600;
	color: rgb(var(--mdui-color-on-surface));
}

.command-description {
	margin: 0 0 6px;
	font-size: 0.92em;
	color: rgb(var(--mdui-color-on-surface-variant));
}

.command-details {
	flex-grow: 1;
	margin: 0 0 12px;
	font-size: 0.88em;
	color: rgb(var(--mdui-color-on-surface-variant));

	// 详细信息过长时截断，完整内容点击卡片后在弹窗中查看
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	line-clamp: 3;
	overflow: hidden;
}

.command-labels {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	align-items: center;
}

.dialog-body h3 {
	margin: 8px 0;
	font-size: 1em;
}

.dialog-details {
	margin: 0 0 12px;
	line-height: 1.7;
	white-space: pre-wrap;
}

.usage {
	font-family: monospace;
	background: rgba(var(--mdui-color-on-surface), 0.08);
	border-radius: 4px;
	padding: 2px 8px;
	display: inline-block;
	margin: 4px 4px 4px 0;
}

@media (max-width: 767px) {
	.search-box,
	.category-section {
		width: 100%;
	}
}
</style>
