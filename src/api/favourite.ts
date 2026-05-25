import type { Favourite } from "@/types/Favourite";
import { get, post, del } from "./request";

export async function getFavourites(): Promise<Favourite[]> {
  return get(`/favourite`);
}

export async function postFavourite(songId: number): Promise<Favourite> {
  return post(`/song/${songId}/favourite`, {});
}

export async function deleteFavourite(songId: number): Promise<Favourite> {
  return del(`/song/${songId}/favourite`);
}
