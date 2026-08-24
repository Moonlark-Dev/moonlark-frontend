// ── Cookie 读写 ──
// 会话凭据（sessionID）的浏览器侧存储。
// 注意：cookie 的过期时间只是「浏览器保留凭据」的时长，登录态实际有效期由服务端会话决定。

const DEFAULT_COOKIE_EXPIRES_DAYS = 730;

/** 组装公共属性：显式 path=/（避免默认路径导致读不到）、SameSite=Lax，HTTPS 下追加 Secure。 */
function cookieAttributes(expireDays: number): string {
    const d = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
    const parts = [`expires=${d.toUTCString()}`, "path=/", "SameSite=Lax"];
    if (typeof location !== "undefined" && location.protocol === "https:") parts.push("Secure");
    return parts.join("; ");
}

export function setCookie(cName: string, cValue?: string, expireDays: number = DEFAULT_COOKIE_EXPIRES_DAYS): void {
    document.cookie = `${cName}=${encodeURIComponent(cValue ?? "")}; ${cookieAttributes(expireDays)}`;
}

/**
 * 真正删除 cookie：写入过去的 expires 让浏览器立刻移除。
 * （旧实现误把 `undefined` 当值写入一个 730 天的新 cookie，本函数同时能清掉这类遗留。）
 */
export function deleteCookie(cName: string): void {
    document.cookie = `${cName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function getCookie(cName: string): string | undefined {
    const name = cName + "=";
    for (const item of document.cookie.split(";")) {
        const trim = item.trim();
        if (trim.startsWith(name)) {
            try {
                return decodeURIComponent(trim.substring(name.length));
            } catch {
                // 值不是合法的 percent-encoding（如旧版写入的字面量），原样返回
                return trim.substring(name.length);
            }
        }
    }
    return undefined;
}
