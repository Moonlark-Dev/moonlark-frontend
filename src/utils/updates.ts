import { apiRequest } from "@/utils/api";
import { cachedRequest, invalidateCache, type CacheOptions } from "@/utils/cache";

export interface UpdateButton {
    label: string;
    text: string;
}

export interface UpdateAnnouncement {
    update_id: number;
    title: string;
    content: string;
    buttons: UpdateButton[];
    time: number;
}

/// 最新公告基本不变，缓存 5 分钟，来回切换页面复用（保存公告后手动 invalidate）
const LATEST_TTL_MS = 5 * 60 * 1000;

/// 获取当前更新公告（公开接口，无需登录）；未发布时返回 null
export async function fetchLatestUpdate(options: CacheOptions = {}): Promise<UpdateAnnouncement | null> {
    const data = await cachedRequest(
        "updates:latest",
        () => apiRequest<{ announcement: UpdateAnnouncement | null }>("/updates/latest", { auth: false }),
        { ttl: LATEST_TTL_MS, ...options },
    );
    return data.announcement;
}

/// 读取当前更新公告（仅超管，供设置页回填）
export async function getUpdateSettings(): Promise<UpdateAnnouncement | null> {
    const data = await apiRequest<{ announcement: UpdateAnnouncement | null }>("/updates/settings");
    return data.announcement;
}

/// 发布新的更新公告（仅超管）：会生成新的版本号并触发用户端提醒
export async function saveUpdateSettings(announcement: {
    title: string;
    content: string;
    buttons: UpdateButton[];
}): Promise<number> {
    invalidateCache("updates:latest");
    const data = await apiRequest<{ success: boolean; update_id: number }>("/updates/settings", {
        method: "PUT",
        body: announcement,
    });
    return data.update_id;
}

/// 清除当前更新公告（仅超管）
export async function clearUpdateSettings(): Promise<void> {
    invalidateCache("updates:latest");
    await apiRequest("/updates/settings", { method: "DELETE" });
}
