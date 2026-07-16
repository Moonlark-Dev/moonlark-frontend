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
    title: string,  // 后端返回的排行标题
    me: null | RankingUser,  // 是完整用户对象，不是字符串
    users: RankingUser[]
}

export interface RankingUser {
    user_id: string,
    nickname: string,
    data: number,
    index: number,
    info: null | string,
    display?: string  // 后端可选返回
}

export async function getRankings() {
    const headers: Record<string, any> = {
        "Content-Type": "application/json"
    };
    if (getSessionIDOrNull()) headers["Authorization"] = `Bearer ${ getSessionID() }`;
    const fetcher = await fetch(API_URL + "/rankings", { method: "GET", headers });
    return (await fetcher.json()) as Rankings;
}

export async function getRankingByURI(uri: string) {
    const headers: Record<string, any> = {
        "Content-Type": "application/json"
    };
    if (getSessionIDOrNull()) headers["Authorization"] = `Bearer ${ getSessionID() }`;
    const fetcher = await fetch(BASE_URL + uri, { method: "GET", headers });
    return (await fetcher.json()) as Ranking;
}

export async function getRankingByName(rankingName: string) {
    const rankingInfo = (await getRankings())[rankingName];
    return await getRankingByURI(rankingInfo.uri);
}
