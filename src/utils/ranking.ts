import { apiRequest, apiRequestFull, getSessionIDOrNull } from "./api";

export interface RankingInfo {
    name: string;
    uri: string;
}

export interface Rankings {
    [name: string]: RankingInfo;
}

export interface Ranking {
    time: number;
    total: number;
    title: string;
    me: null | RankingUser;
    users: RankingUser[];
}

export interface RankingUser {
    user_id: string;
    nickname: string;
    data: number;
    index: number;
    info: null | string;
    display?: string;
}

export async function getRankings(): Promise<Rankings> {
    return apiRequest<Rankings>("/rankings");
}

export async function getRankingByURI(uri: string): Promise<Ranking> {
    return apiRequestFull<Ranking>(uri);
}

export async function getRankingByName(rankingName: string): Promise<Ranking> {
    const rankings = await getRankings();
    const info = rankings[rankingName];
    if (!info) throw new Error(`Ranking "${rankingName}" not found`);
    return getRankingByURI(info.uri);
}
