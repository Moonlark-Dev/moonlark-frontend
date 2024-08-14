<script setup lang="ts">
import { getRankingByURI, getRankings, type Ranking, type Rankings } from "@/utils/ranking";
import { onMounted, ref } from "vue";

const rankingData = ref<Record<string, Ranking>>({});

async function * fetchRankingData() {
	const rankings: Rankings = await getRankings();
	const race = Object.values(rankings).map(async item => [ item.name, await getRankingByURI(item.uri) ] as [ string, Ranking ]);
	for (const item of await Promise.allSettled(race)) {
		if (item.status == "fulfilled") yield item.value;
	}
}

onMounted(
	async () => {
		const entries: Record<string, Ranking> = {};
		for await (const item of fetchRankingData()) entries[item[0]] = item[1];
		rankingData.value = entries;
	}
);

function showDate(time: number) {
	const date = new Date(time);
	return ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
}

</script>

<template>
	<h1>排行</h1>
	<mdui-list>
		<mdui-collapse accordion>
			<mdui-collapse-item v-for="[rankingName, ranking] of Object.entries(rankingData)" v-bind:key="ranking">
				<mdui-list-item slot="header" icon="leaderboard">
					<h3>{{ rankingName }} ({{ ranking.total }}) - {{ showDate(ranking.time) }}</h3>
				</mdui-list-item>
				<mdui-list-item v-for="user of ranking.users.sort((a, b) => a.index > b.index ? 1 : -1)"
								v-bind:key="user">
					{{ user.index }}. {{ user.nickname }} ({{ user.info ?? user.user_id }}) - {{ user.data }}
				</mdui-list-item>
				<mdui-divider inset></mdui-divider>
			</mdui-collapse-item>
		</mdui-collapse>
	</mdui-list>
</template>
