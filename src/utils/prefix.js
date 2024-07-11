import { BASE_URL } from "./user";

export async function getPrefix() {
    let response = await fetch(BASE_URL + "/prefix", {
        headers: {
            "Content-Type": "application/json"
        }
    });
    let data = await response.json();
    return data.prefix;
}