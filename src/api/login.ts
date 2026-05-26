import type { Login } from "@/types/Login";
import { post } from "./request";

export async function getLogin(login: Login): Promise<boolean> {
  return post(`/login`, login);
}
