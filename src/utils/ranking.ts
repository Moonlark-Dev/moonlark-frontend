import { apiRequest, apiRequestFull } from "./api";
import { cachedRequest, type CacheOptions } from "./cache";

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

/** 排行数据缓存时长：切换页面时直接复用缓存，避免重复请求 */
const RANKINGS_TTL_MS = 3 * 60 * 1000;

export async function getRankings(options: CacheOptions = {}): Promise<Rankings> {
    return cachedRequest("rankings", () => apiRequest<Rankings>("/rankings"), { ttl: RANKINGS_TTL_MS, ...options });
}

export async function getRankingByURI(uri: string, options: CacheOptions = {}): Promise<Ranking> {
    return cachedRequest(`ranking:${uri}`, () => apiRequestFull<Ranking>(uri), { ttl: RANKINGS_TTL_MS, ...options });
}

export async function getRankingByName(rankingName: string, options: CacheOptions = {}): Promise<Ranking> {
    const rankings = await getRankings(options);
    const info = rankings[rankingName];
    if (!info) throw new Error(`Ranking "${rankingName}" not found`);
    return getRankingByURI(info.uri, options);
}
