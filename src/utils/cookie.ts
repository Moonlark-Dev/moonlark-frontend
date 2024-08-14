const DEFAULT_COOKIE_EXPIRES_DAYS = 730;


export function setCookie(cName: string, cValue: string | undefined, expireDays: number = DEFAULT_COOKIE_EXPIRES_DAYS): void {
    const d = new Date();
    d.setTime(d.getTime() + (expireDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires;
}

export function getCookie(cName: string): string | undefined {
    const name = cName + "=";
    const split = document.cookie.split(';');
    for (const i of split) {
        const trim = i.trim();
        if (trim.indexOf(name) == 0) return trim.substring(name.length, trim.length);
    }
    return undefined;
}
