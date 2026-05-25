import type { PutSongMetadata } from "@/types/PutSongMetadata";
import { get, postForm, put } from "./request";
import type { Song } from "@/types/Song";
import type { UploadResponse } from "@/types/UploadResponse";
import type { AudioFile } from "@/types/AudioFile";

export async function getFiles(): Promise<AudioFile[]> {
  return get(`/audio`);
}

export async function uploadSong(file: File): Promise<UploadResponse> {
  return postForm(`/audio`, { file });
}

export async function putMetadata(
  id: number,
  metadata: PutSongMetadata,
): Promise<Song> {
  return put(`/audio/${id}/metadata`, metadata);
}

export async function getSongs(): Promise<Song[]> {
  return get(`/song`);
}
