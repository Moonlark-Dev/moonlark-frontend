import {
    ApiError,
    apiCheck,
    apiRequest,
    getSessionID,
    getSessionIDOrNull,
    isAbortError,
    isAuthError,
    logout as apiLogout,
    sleep,
} from "./api";
import { setCookie } from "./cookie";
import { clearApiCache } from "./cache";
import { setCachedPrefix } from "./prefix";

// Re-export session helpers for backward compatibility
export { getSessionIDOrNull, getSessionID };

export function logout(): void {
    apiLogout();
    invalidateSessionCache();
    clearApiCache(); // 排行等缓存含个人数据，登出后必须清空
}

// ── 会话状态单飞缓存 ──
// 页面与导航栏各自调用 isLoggedIn()/getCurrentUser() 会产生重复请求，
// 这里用短 TTL 缓存 + 单飞（in-flight 共享）把一次导航的鉴权请求收敛到最多一组。

const SESSION_CACHE_TTL_MS = 10_000;

interface CacheEntry<T> {
    value: T;
    cachedAt: number;
}

let loggedInCache: CacheEntry<boolean> | null = null;
let loggedInInflight: Promise<boolean> | null = null;
let userCache: CacheEntry<UserData> | null = null;
let userInflight: Promise<UserData> | null = null;

/** 登录 / 登出后清除会话缓存，避免读到过期的登录态 */
export function invalidateSessionCache(): void {
    loggedInCache = null;
    userCache = null;
}

export async function isLoggedIn(): Promise<boolean> {
    if (!getSessionIDOrNull()) return false; // 无会话凭据：无需发请求
    if (loggedInCache && Date.now() - loggedInCache.cachedAt < SESSION_CACHE_TTL_MS) {
        return loggedInCache.value;
    }
    if (!loggedInInflight) {
        loggedInInflight = apiCheck("/users/me/permissions")
            .then(value => {
                loggedInCache = { value, cachedAt: Date.now() };
                return value;
            })
            .finally(() => {
                loggedInInflight = null;
            });
    }
    return loggedInInflight;
}

export async function requestBindMainAccount(mainUserID: string): Promise<string | undefined> {
    const data = await apiRequest<{ activate_code: string }>(`/users/${mainUserID}/sub-account/bind`, {
        method: "POST",
    });
    return data.activate_code;
}

export interface LoginResult {
    session_id: string;
    activate_code: string;
    effective_time: number;
    /** 新版后端直接返回指令前缀，前端无需再请求 /prefix */
    command_prefix?: string;
}

export interface ResultWithMessage {
    success: boolean;
    message: string;
}

export interface UserData {
    user_id: string;
    nickname: string;
    experience: number;
    total_experience: number;
    level: number;
    vimcoin: number;
    favorability: number;
    health: number;
    register_time: number | undefined;
    avatar: string | undefined;
}

export async function login(userID: string): Promise<LoginResult> {
    const data = await apiRequest<LoginResult>("/login", {
        method: "POST",
        body: { user_id: userID },
        auth: false,
    });
    setCookie("sessionID", data.session_id);
    if (data.command_prefix != null) setCachedPrefix(data.command_prefix);
    invalidateSessionCache();
    clearApiCache(); // 账号切换后清空旧账号的缓存数据
    return data;
}

export async function postChangeNickname(nickname: string): Promise<ResultWithMessage> {
    return apiRequest<ResultWithMessage>("/users/me", {
        method: "POST",
        body: { nickname },
    });
}

export async function getCurrentUser(): Promise<UserData> {
    if (userCache && Date.now() - userCache.cachedAt < SESSION_CACHE_TTL_MS) {
        return userCache.value;
    }
    if (!userInflight) {
        userInflight = apiRequest<UserData>("/users/me")
            .then(value => {
                userCache = { value, cachedAt: Date.now() };
                return value;
            })
            .finally(() => {
                userInflight = null;
            });
    }
    return userInflight;
}

// ── 登录激活等待 ──

const PENDING_MAX_WAIT_SECONDS = 25;

/** 后端是否提供 /login/pending 接口；收到 404 时降级为旧的权限轮询 */
let pendingEndpointAvailable = true;

export type ActivationWaitResult = "activated" | "timeout";

/**
 * 等待登录激活完成。
 *
 * - 优先长轮询 `/login/pending`：单次请求服务端挂起至多 25s，激活立即返回，
 *   整个等待期请求数约为 等待时长 / 25s；
 * - 后端未部署新接口（404）时自动降级为自适应间隔的权限轮询（1s → 2s → 4s）；
 * - 网络瞬时失败按指数退避重试；会话失效（401/403）视为超时；
 * - 到达 deadline 返回 "timeout"；signal 取消时抛出 AbortError。
 */
export async function waitForActivation(signal: AbortSignal, deadline: number): Promise<ActivationWaitResult> {
    const startedAt = Date.now();
    let consecutiveFailures = 0;
    while (!signal.aborted) {
        if (Date.now() >= deadline) return "timeout";
        try {
            if (pendingEndpointAvailable) {
                const remainingSeconds = Math.ceil((deadline - Date.now()) / 1000);
                const wait = Math.max(0, Math.min(PENDING_MAX_WAIT_SECONDS, remainingSeconds));
                const data = await apiRequest<{ activated: boolean }>(`/login/pending?wait=${wait}`, { signal });
                if (data.activated) return "activated";
                consecutiveFailures = 0;
            } else {
                if (await apiCheck("/users/me/permissions", { signal })) return "activated";
                const elapsed = Date.now() - startedAt;
                await sleep(elapsed < 10_000 ? 1_000 : elapsed < 60_000 ? 2_000 : 4_000, signal);
            }
        } catch (error) {
            if (isAbortError(error)) throw error;
            if (isAuthError(error)) return "timeout"; // 会话已被服务端清理或过期
            if (pendingEndpointAvailable && error instanceof ApiError && error.status === 404) {
                pendingEndpointAvailable = false; // 后端尚未部署，降级
                continue;
            }
            consecutiveFailures += 1;
            await sleep(Math.min(1_000 * 2 ** Math.min(consecutiveFailures, 4), 15_000), signal);
        }
    }
    throw new DOMException("Aborted", "AbortError");
}
