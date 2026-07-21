import { getStoredBaseUrl } from "./utils";

const ADMIN_STORAGE_KEY = "moonlark_admin_password";

export function getAdminPassword(): string | null {
    return localStorage.getItem(ADMIN_STORAGE_KEY);
}

export function setAdminPassword(password: string): void {
    localStorage.setItem(ADMIN_STORAGE_KEY, password);
}

export function clearAdminPassword(): void {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
}

/**
 * 生成随机的 salt
 */
function generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 计算 SHA-256 hash
 */
async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 验证是否已配置管理员密码
 */
export function hasAdminConfig(): boolean {
    return getAdminPassword() !== null;
}

/**
 * 生成带认证的请求 URL
 */
export async function buildAdminUrl(path: string): Promise<string> {
    const password = getAdminPassword();
    if (!password) throw new Error("未配置管理员密码");
    const salt = generateSalt();
    const token = await sha256(password + salt);
    const baseUrl = getStoredBaseUrl().replace(/\/+$/, "");
    return `${baseUrl}${path}?token=${token}&salt=${salt}`;
}

/**
 * 发起管理员 API 请求
 */
async function adminRequest<T>(path: string): Promise<T> {
    const url = await buildAdminUrl(path);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`管理员 API 请求失败: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// ── 各端点类型定义 ──

export interface BotStatus {
    user_id: string;
    online: boolean;
    adapter_name?: string;
    good?: boolean;
    nickname?: string | null;
}

export interface ExceptionItem {
    exception: string;
    session: string | null;
    message: string | null;
    bot_id: string;
    timestamp: number;
}

export interface EventCounter {
    total: number;
    success: number;
    failed: number;
}

export interface OpenAIHistoryItem {
    model: string;
    identify: string;
    messages: Record<string, unknown>[];
}

export interface RunResult {
    result: "success" | "skipped" | "failed";
    message: string;
    handler: {
        lineno: number;
        filename: string;
        name: string;
        plugin: string;
    };
    timestamp: number;
}

export interface HandlerResultItem {
    command_name: string;
    message: string;
    result: RunResult[];
    matcher: string;
}

export interface StatusOverview {
    bots: Record<string, BotStatus>;
    plugins: string[];
    event_counter: EventCounter;
}

// ── API 函数 ──

export async function getAdminOverview(): Promise<StatusOverview> {
    return adminRequest<StatusOverview>("/admin/status");
}

export async function getAdminBots(): Promise<Record<string, BotStatus>> {
    return adminRequest<Record<string, BotStatus>>("/admin/status/bots");
}

export async function getAdminExceptions(): Promise<ExceptionItem[]> {
    return adminRequest<ExceptionItem[]>("/admin/status/exceptions");
}

export async function getAdminPlugins(): Promise<string[]> {
    return adminRequest<string[]>("/admin/status/plugins");
}

export async function getAdminEvents(): Promise<EventCounter> {
    return adminRequest<EventCounter>("/admin/status/events");
}

export async function getAdminOpenAI(): Promise<OpenAIHistoryItem[]> {
    return adminRequest<OpenAIHistoryItem[]>("/admin/status/openai");
}

export async function getAdminCommands(): Promise<Record<string, number>> {
    return adminRequest<Record<string, number>>("/admin/status/commands");
}

export async function getAdminHandlers(): Promise<HandlerResultItem[]> {
    return adminRequest<HandlerResultItem[]>("/admin/status/handlers");
}
