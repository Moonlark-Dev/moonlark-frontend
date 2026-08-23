const STORAGE_KEY = "moonlark_last_login_user_id";

/** 读取上一次登录时填写的用户 ID；无记录或 localStorage 不可用时返回空串 */
export function getLastLoginUser(): string {
    try {
        return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
        return "";
    }
}

/** 记录本次登录填写的用户 ID，供下一次登录预填充；localStorage 不可用时静默跳过 */
export function setLastLoginUser(userID: string): void {
    try {
        localStorage.setItem(STORAGE_KEY, userID);
    } catch {
        // localStorage 不可用时静默跳过
    }
}
