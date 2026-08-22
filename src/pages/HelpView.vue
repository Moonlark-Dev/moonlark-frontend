<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchHelpList, type HelpCategory } from '@/utils/menupanel';

const categories = ref<HelpCategory[]>();
const error = ref('');

onMounted(async () => {
	try {
		categories.value = await fetchHelpList();
	} catch (e) {
		error.value = e instanceof Error ? e.message : String(e);
	}
});

</script>

<template>
	<h1>Moonlark 指令帮助</h1>
	<p v-if="error">帮助数据加载失败：{{ error }}</p>
	<p v-else-if="!categories">正在加载……</p>
	<template v-else>
		<mdui-card v-for="category of categories" v-bind:key="category.name" variant="outlined" class="category-card">
			<div class="category-content">
				<h2>{{ category.name }}</h2>
				<mdui-list>
					<mdui-collapse accordion>
						<mdui-collapse-item v-for="command of category.commands" v-bind:key="command.name"
											:value="command.name">
							<mdui-list-item slot="header" icon="terminal">
								{{ command.name }} —— {{ command.description }}
							</mdui-list-item>
							<div class="command-detail">
								<p>{{ command.details }}</p>
								<p v-for="usage of command.usages" v-bind:key="usage" class="usage">{{ usage }}</p>
							</div>
						</mdui-collapse-item>
					</mdui-collapse>
				</mdui-list>
			</div>
		</mdui-card>
	</template>
</template>

<style scoped lang="scss">
.category-card {
	width: 67%;
	margin-bottom: 16px;
}

.category-content {
	padding: 4px 20px 12px;
}

.command-detail {
	padding: 0 16px 12px;
}

.usage {
	font-family: monospace;
	background: rgba(128, 128, 128, 0.12);
	border-radius: 4px;
	padding: 2px 8px;
	display: inline-block;
	margin: 4px 0;
}

@media (max-width: 767px) {
	.category-card {
		width: 100%;
	}
}
</style>
