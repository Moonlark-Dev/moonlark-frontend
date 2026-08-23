// ── 接口数据内存缓存 ──
// 页面切换时组件会重新挂载并重复请求相同接口；
// 这里提供带 TTL 与 single-flight 的通用缓存，让排行、帮助等列表数据在页面间复用，
// 需要最新数据时由页面显式传入 force 绕过缓存（刷新按钮）。

export interface CacheOptions {
    /** 缓存有效期（毫秒），默认 5 分钟 */
    ttl?: number;
    /** 为 true 时跳过已缓存结果，强制重新请求；结果仍会回填缓存 */
    force?: boolean;
}

interface CacheEntry<T> {
    value: T;
    cachedAt: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000;

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * 带缓存的请求封装。
 *
 * - 同一 key 在 TTL 内的读取直接复用上次结果，不发起网络请求；
 * - 并发读取（含页面快速来回切换）自动合并为一次真实请求（single-flight）；
 * - force 为 true 时跳过缓存重新请求，用于手动刷新。
 *
 * 请求失败时不会写入缓存，下次读取会再次尝试。
 */
export async function cachedRequest<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const ttl = options.ttl ?? DEFAULT_TTL_MS;
    if (!options.force) {
        const entry = store.get(key) as CacheEntry<T> | undefined;
        if (entry && Date.now() - entry.cachedAt < ttl) {
            return entry.value;
        }
    }
    const pending = inflight.get(key);
    if (pending) return pending as Promise<T>;
    const request = fetcher()
        .then(value => {
            store.set(key, { value, cachedAt: Date.now() });
            return value;
        })
        .finally(() => {
            inflight.delete(key);
        });
    inflight.set(key, request);
    return request;
}

/** 使指定 key 的缓存失效，下次读取将重新请求 */
export function invalidateCache(key: string): void {
    store.delete(key);
}

/** 上次写入缓存的时间戳（毫秒）；该 key 从未成功获取时返回 undefined */
export function getCachedAt(key: string): number | undefined {
    return store.get(key)?.cachedAt;
}

/** 清空全部接口缓存与进行中的请求（登录、登出等账号状态变化时调用，避免串号） */
export function clearApiCache(): void {
    inflight.clear();
    store.clear();
}
