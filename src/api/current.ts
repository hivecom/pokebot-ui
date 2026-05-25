import { get, post } from "./request";
import type { AudioMetadata } from "@/types/AudioMetadata";
import type { PlaySong } from "@/types/PlaySong";

export async function getAlbums(): Promise<AudioMetadata[]> {
  return get(`/playlist/current`);
}

export async function postSong(id: number): Promise<AudioMetadata> {
  return post(`/playlist/current`, { id });
}
