import { API_URL } from "@/utils/utils";

export async function getPrefix(): Promise<string> {
	const response = await fetch(API_URL + "/prefix", {
		headers: {
			"Content-Type": "application/json"
		}
	});
	const data = await response.json();
	return data.prefix as string;
}
