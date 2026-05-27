import type { BotData } from "@/types/BotData";
import { get, post, put } from "./request";
import type { PutState } from "@/types/PutState";

export async function getBotData(): Promise<BotData> {
  return get(`/bot/self`);
}

export async function postBot(): Promise<void> {
  return post(`/bot/self`, {});
}

export async function putState(state: PutState): Promise<BotData> {
  return put(`/bot/self`, state);
}
