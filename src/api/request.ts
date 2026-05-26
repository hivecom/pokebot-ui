import axios, { AxiosError, type AxiosResponse } from "axios";

export let URL_ROOT = "https://pokebot.hivecom.net";
if (import.meta.env.DEV) {
  URL_ROOT = "http://localhost:45538";
}

export const API_ROOT = `${URL_ROOT}/api`;

async function handleResponse<O>(
  response: Promise<AxiosResponse<O>>,
): Promise<O> {
  return response.then((response) => {
    return response.data;
  });
}

export async function get<O>(path: string): Promise<O> {
  return handleResponse(axios.get(`${API_ROOT}${path}`));
}

export async function post<I, O>(path: string, body: I): Promise<O> {
  return handleResponse(axios.post(`${API_ROOT}${path}`, body));
}

export async function postForm<I, O>(path: string, body: I): Promise<O> {
  return handleResponse(axios.postForm(`${API_ROOT}${path}`, body));
}

export async function put<I, O>(path: string, body: I): Promise<O> {
  return handleResponse(axios.put(`${API_ROOT}${path}`, body));
}

export async function del<O>(path: string): Promise<O> {
  return handleResponse(axios.delete(`${API_ROOT}${path}`));
}
