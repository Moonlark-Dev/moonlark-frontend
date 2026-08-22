import { getCookie, setCookie } from "./cookie";
import { API_URL, BASE_URL } from "./utils";

// ── Session ──

export function getSessionIDOrNull(): string | null {
    return getCookie("sessionID") ?? null;
}

export function getSessionID(): string {
    return getSessionIDOrNull()!;
}

export function logout(): void {
    setCookie("sessionID", undefined);
}

// ── API Client ──

type HttpMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";

export interface RequestOptions {
    method?: HttpMethod;
    body?: unknown;
    auth?: boolean;
    signal?: AbortSignal;
}

async function buildHeaders(auth: boolean): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (auth) {
        const sessionId = getSessionIDOrNull();
        if (sessionId) {
            headers["Authorization"] = `Bearer ${sessionId}`;
        }
    }
    return headers;
}

/**
 * API 请求（路径相对于 API_URL）
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, auth = true, signal } = options;
    const headers = await buildHeaders(auth);
    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
        signal,
    });
    if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
    }
    return response.json();
}

/**
 * API 请求（使用完整 BASE_URL + uri，用于服务端返回的绝对路径）
 */
export async function apiRequestFull<T>(uri: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, auth = true, signal } = options;
    const headers = await buildHeaders(auth);
    const response = await fetch(`${BASE_URL}${uri}`, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
        signal,
    });
    if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
    }
    return response.json();
}

/**
 * 获取请求状态（不解析 body）
 */
export async function apiCheck(path: string, options: RequestOptions = {}): Promise<boolean> {
    try {
        const { signal } = options;
        const headers = await buildHeaders(true);
        const response = await fetch(`${API_URL}${path}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            signal,
        });
        return response.ok;
    } catch (error) {
        if (isAbortError(error)) throw error;
        return false;
    }
}

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(`API Error ${status}: ${message}`);
        this.status = status;
    }
}

// ── 错误分类 ──

/** 认证失败（401/403）：会话无效、未激活或已过期，重试无意义 */
export function isAuthError(error: unknown): boolean {
    return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

/** 网络层错误（fetch 抛出的 TypeError）：瞬时故障，值得重试 */
export function isNetworkError(error: unknown): boolean {
    return error instanceof TypeError;
}

/** 请求被 AbortController 主动取消 */
export function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === "AbortError";
}

/**
 * 可中断的延时；signal 被取消时抛出 AbortError
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
        }
        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        function onAbort() {
            clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
        }
        signal?.addEventListener("abort", onAbort, { once: true });
    });
}
