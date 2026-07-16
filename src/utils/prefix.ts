import { apiRequest } from "./api";

export async function getPrefix(): Promise<string> {
    const data = await apiRequest<{ prefix: string }>("/prefix", { auth: false });
    return data.prefix;
}
