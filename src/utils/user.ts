import { apiRequest, apiCheck, logout as apiLogout, getSessionIDOrNull, getSessionID } from "./api";

// Re-export session helpers for backward compatibility
export { getSessionIDOrNull, getSessionID };

export function logout(): void {
    apiLogout();
}

export async function isLoggedIn(): Promise<boolean> {
    return apiCheck("/users/me/permissions");
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
    const { setCookie } = await import("./cookie");
    setCookie("sessionID", data.session_id);
    return data;
}

export async function postChangeNickname(nickname: string): Promise<ResultWithMessage> {
    return apiRequest<ResultWithMessage>("/users/me", {
        method: "POST",
        body: { nickname },
    });
}

export async function getCurrentUser(): Promise<UserData> {
    return apiRequest<UserData>("/users/me");
}
