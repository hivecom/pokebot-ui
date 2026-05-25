import { get } from "./request";
import type { Album } from "@/types/Album";

export async function getAlbums(): Promise<Album[]> {
  return get(`/album`);
}
