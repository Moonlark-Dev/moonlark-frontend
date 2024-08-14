import { getCookie, setCookie } from "@/utils/cookie.js";
import { API_URL } from "@/utils/utils";

export function getSessionIDOrNull(): string | null {
	return getCookie("sessionID") ?? null;
}

export function getSessionID(): string {
	return getSessionIDOrNull()!!;
}

export function logout(): void {
	setCookie("sessionID", undefined);
}

export async function isLoggedIn(): Promise<boolean> {
	const response = await fetch(API_URL + "/users/me", {
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + getSessionID()
		}
	});
	return response.ok;
}

export async function requestBindMainAccount(mainUserID: string): Promise<string | undefined> {
	const response = await fetch(API_URL + `/users/${ mainUserID }/sub-account/bind`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + getSessionID()
		}
	});
	return (await response.json()).activate_code;
}

export interface LoginResult {
	session_id: string,
	activate_code: string,
	effective_time: number
}

export interface UserData {
	user_id: string,
	nickname: string,
	experience: number,
	level: number,
	vimcoin: number,
	favorability: number,
	health: number,
	register_time: number | undefined,
	activation_time: number,
	ship_code: number | undefined,
	avatar: string | undefined
}

export async function login(userID: string): Promise<LoginResult> {
	const response = await fetch(API_URL + "/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			user_id: userID
		})
	});
	const data = await response.json();
	setCookie("sessionID", data.session_id);
	return data;
}

export async function getCurrentUser(): Promise<UserData> {
	const response = await fetch(API_URL + "/users/me", {
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + getSessionID()
		}
	});
	return await response.json();
}

