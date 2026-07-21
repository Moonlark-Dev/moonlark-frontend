const STORAGE_KEY = "moonlark_backend_url";
const DEFAULT_BASE_URL = "https://moonlark-api.itcdt.top";

function readStoredBaseUrl(): string {
    try {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE_URL;
    } catch {
        return DEFAULT_BASE_URL;
    }
}

/** @deprecated 使用 getBaseUrl() 获取动态值，此常量在模块加载时固定 */
export const BASE_URL = readStoredBaseUrl().replace(/\/+$/, "");

/** @deprecated 使用 getApiUrl() 获取动态值，此常量在模块加载时固定 */
export const API_URL = `${BASE_URL}/api`;

export function getStoredBaseUrl(): string {
    return readStoredBaseUrl();
}

export function getBaseUrl(): string {
    return getStoredBaseUrl().replace(/\/+$/, "");
}

export function getApiUrl(): string {
    return `${getBaseUrl()}/api`;
}

export function setStoredBaseUrl(url: string): void {
    localStorage.setItem(STORAGE_KEY, url);
}

export function resetStoredBaseUrl(): void {
    localStorage.removeItem(STORAGE_KEY);
}
