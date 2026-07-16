import { getCookie, setCookie } from "./cookie";
import { API_URL, BASE_URL } from "./utils";

// ── Session ──

export function getSessionIDOrNull(): string | null {
    return getCookie("sessionID") ?? null;
}

export function getSessionID(): string {
    return getSessionIDOrNull()!!;
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
    const { method = "GET", body, auth = true } = options;
    const headers = await buildHeaders(auth);
    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
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
    const { method = "GET", body, auth = true } = options;
    const headers = await buildHeaders(auth);
    const response = await fetch(`${BASE_URL}${uri}`, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
    }
    return response.json();
}

/**
 * 获取请求状态（不解析 body）
 */
export async function apiCheck(path: string): Promise<boolean> {
    try {
        const headers = await buildHeaders(true);
        const response = await fetch(`${API_URL}${path}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        });
        return response.ok;
    } catch {
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
