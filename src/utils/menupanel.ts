import { apiRequest, ApiError } from "@/utils/api";
import { cachedRequest, type CacheOptions } from "@/utils/cache";

export interface CommandInfo {
    name: string;
    description: string;
    details: string;
    usages: string[];
    category: string;
}

export interface HelpCategory {
    name: string;
    commands: CommandInfo[];
}

export interface MenuPanelSettings {
    commands: string[];
    updated_at: number;
}

export interface SyncResult {
    self_id: string;
    success: boolean;
    message: string;
}

export interface SyncResponse {
    success: boolean;
    results: SyncResult[];
}

/** 指令帮助数据基本不变，缓存 10 分钟，切换页面时直接复用 */
const HELP_LIST_TTL_MS = 10 * 60 * 1000;

/// 获取按分类聚合的全部指令帮助数据（公开接口，无需登录）
export async function fetchHelpList(options: CacheOptions = {}): Promise<HelpCategory[]> {
    return await cachedRequest("help:list", () => apiRequest<HelpCategory[]>("/help/list", { auth: false }), {
        ttl: HELP_LIST_TTL_MS,
        ...options,
    });
}

/// 当前登录用户是否为超级管理员
export async function isSuperuser(): Promise<boolean> {
    try {
        const data = await apiRequest<{ superuser: boolean }>("/menupanel/permission");
        return data.superuser === true;
    } catch (e) {
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return false;
        throw e;
    }
}

/// 读取 QQ 菜单/面板展示指令配置（仅超管）
export async function getMenuPanelSettings(): Promise<MenuPanelSettings> {
    return await apiRequest<MenuPanelSettings>("/menupanel/settings");
}

/// 保存 QQ 菜单/面板展示指令配置（仅超管）
export async function saveMenuPanelSettings(commands: string[]): Promise<void> {
    await apiRequest("/menupanel/settings", { method: "PUT", body: { commands } });
}

/// 将当前配置同步到 QQ 自定义菜单与指令面板（仅超管）
export async function syncMenuPanel(): Promise<SyncResponse> {
    return await apiRequest<SyncResponse>("/menupanel/sync", { method: "POST" });
}
