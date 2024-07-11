import { getCookie, setCookie } from "@/utils/cookie.js";

export const BASE_URL = "https://moonlark-api.itcdt.top/api"

export function getSessionID() {
    return getCookie("sessionID");
}

export function logout() {
    setCookie("sessionID", undefined);
}

export async function isLoggedIn() {
    let response = await fetch(BASE_URL + "/users/me", {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getSessionID()
        }
    });
    return response.ok;
}


export async function login(user_id) {
    let response = await fetch(BASE_URL + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: user_id
        })
    });
    let data = await response.json();
    setCookie("sessionID", data.session_id);
    return data;
}

export async function getCurrentUser() {
    let response = await fetch(BASE_URL + "/users/me", {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getSessionID()
        }
    });
    return await response.json()
}

