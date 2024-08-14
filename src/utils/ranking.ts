import { getSessionID, getSessionIDOrNull } from "@/utils/user";
import { API_URL, BASE_URL } from "@/utils/utils";

export interface RankingInfo {
	name: string,
	uri: string,
}

export interface Rankings {
	[name: string]: RankingInfo;
}

export interface Ranking {
	time: number,
	total: number,
	me: null | string,
	users: RankingUser[]
}

export interface RankingUser {
	user_id: string,
	nickname: string,
	data: number,
	index: number,
	info: null | string
}

export async function getRankings() {
	const fetcher = await fetch(API_URL + "/rankings", { method: "GET" });
	return (await fetcher.json()) as Rankings;
}

export async function getRankingByURI(uri: string) {
	let headers: Record<string, any> = {
		"Content-Type": "application/json"
	};
	if (getSessionIDOrNull()) headers["Authorization"] = `Bearer ${ getSessionID() }`;
	const fetcher = await fetch(BASE_URL + uri, { method: "GET", headers });
	return (await fetcher.json()) as Ranking;
}

export async function getRankingByName(rankingName: string) {
	const rankingInfo = (await getRankings())[rankingName];
	return await getRankingByURI(rankingInfo.uri)
}
