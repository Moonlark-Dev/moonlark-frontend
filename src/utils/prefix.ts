import { BASE_URL } from "./user";

export async function getPrefix(): Promise<string> {
    const response = await fetch(BASE_URL + "/prefix", {
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    return data.prefix as string;
}
