import { apiRequest } from "./api";

const CACHE_KEY = "moonlark_command_prefix";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface PrefixCache {
    prefix: string;
    cachedAt: number;
}

function readCache(): PrefixCache | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as PrefixCache;
        if (typeof parsed.prefix !== "string" || typeof parsed.cachedAt !== "number") return null;
        return parsed;
    } catch {
        return null;
    }
}

export function setCachedPrefix(prefix: string): void {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ prefix, cachedAt: Date.now() } satisfies PrefixCache));
    } catch {
        // localStorage 不可用时静默跳过
    }
}

/**
 * 获取指令前缀：优先使用缓存（24h TTL），请求失败时回退到过期缓存，最终回退为空串。
 * 该函数不会抛出异常——prefix 只用于展示文案，绝不应让登录流程因它而失败。
 */
export async function getPrefix(): Promise<string> {
    const cache = readCache();
    if (cache && Date.now() - cache.cachedAt < CACHE_TTL_MS) {
        return cache.prefix;
    }
    try {
        const data = await apiRequest<{ prefix: string }>("/prefix", { auth: false });
        setCachedPrefix(data.prefix);
        return data.prefix;
    } catch {
        return cache?.prefix ?? "";
    }
}
