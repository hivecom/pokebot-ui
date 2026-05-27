import { useQueryCache, defineMutation, useMutation } from "@pinia/colada";
import { postSong } from "@/api/current";
import {
  ALBUM_STORE_KEY,
  AUDIO_FILE_STORE_KEY,
  BOT_STORE_KEY,
  CURRENT_STORE_KEY,
  FAVOURITE_STORE_KEY,
} from "@/main";
import type { AudioMetadata } from "@/types/AudioMetadata";
import type { BotData } from "@/types/BotData";
import type { Song } from "@/types/Song";
import { postBot, putState } from "@/api/botData";
import type { AudioFile } from "@/types/AudioFile";
import { deleteFavourite, postFavourite } from "@/api/favourite";
import type { Favourite } from "@/types/Favourite";
import type { Album } from "@/types/Album";

export const usePlaySong = defineMutation(() => {
  const queryCache = useQueryCache();
  return useMutation({
    mutation: (song: Song) => postSong(song.id),
    onMutate(song) {
      let oldBotData = queryCache.getQueryData<BotData>(BOT_STORE_KEY);
      if (!oldBotData) {
        return;
      }

      let files = queryCache.getQueryData<AudioFile[]>(AUDIO_FILE_STORE_KEY);
      const matchingFile = files?.find((f) => f.id === song.file_id);
      const newItem = {
        id: 0,
        url: matchingFile?.file_path ?? "",
        title: song.title,
        webpage_url: null,
        artist: song.artist,
        album: song.album,
        thumbnail: null,
        duration: matchingFile?.duration ?? 0,
      };

      if (oldBotData && !oldBotData.currently_playing) {
        const newBotData = { ...oldBotData, currently_playing: newItem };
        queryCache.setQueryData(BOT_STORE_KEY, newBotData);
        queryCache.cancelQueries({ key: BOT_STORE_KEY });

        return {
          newPlaylist: null,
          oldPlaylist: null,
          newBotData,
          oldBotData,
          newItem,
        };
      } else {
        let oldPlaylist =
          queryCache.getQueryData<AudioMetadata[]>(CURRENT_STORE_KEY) ?? [];

        const maxId =
          oldPlaylist.length > 0
            ? Math.max(...oldPlaylist.map((a) => a.id))
            : 0;
        newItem.id = maxId < 0 ? 0 : maxId;
        const newPlaylist: AudioMetadata[] = [...oldPlaylist, newItem];

        queryCache.setQueryData(CURRENT_STORE_KEY, newPlaylist);
        queryCache.cancelQueries({ key: CURRENT_STORE_KEY });

        return {
          newPlaylist,
          oldPlaylist,
          newBotData: null,
          oldBotData: null,
          newItem,
        };
      }
    },

    // on both error and success
    onSettled() {
      queryCache.invalidateQueries({ key: CURRENT_STORE_KEY });
    },

    onError(err, _title, { oldPlaylist, newPlaylist, oldBotData, newBotData }) {
      if (newPlaylist === queryCache.getQueryData(CURRENT_STORE_KEY)) {
        queryCache.setQueryData(CURRENT_STORE_KEY, oldPlaylist);
      }
      if (newBotData === queryCache.getQueryData(BOT_STORE_KEY)) {
        queryCache.setQueryData(BOT_STORE_KEY, oldBotData);
      }

      // handle the error
      console.error("An error occurred when adding a song:", err);
    },

    onSuccess(
      playlistItem: AudioMetadata,
      _vars,
      { newItem }: { newItem: AudioMetadata },
    ) {
      const botData = queryCache.getQueryData<BotData>(BOT_STORE_KEY);
      if (botData && !botData.currently_playing) {
        queryCache.setQueryData(BOT_STORE_KEY, {
          ...botData,
          currently_playing: playlistItem,
        });
      }

      const playlist =
        queryCache.getQueryData<AudioMetadata[]>(CURRENT_STORE_KEY) ?? [];
      const songIndex = playlist.findIndex((t) => t.id === newItem.id);
      if (songIndex >= 0) {
        const copy = playlist.slice();
        copy.splice(songIndex, 1, playlistItem);
        queryCache.setQueryData(CURRENT_STORE_KEY, copy);
      }
    },
  });
});

export const useSetSeek = defineMutation(() => {
  const queryCache = useQueryCache();
  return useMutation({
    mutation: (position: number) =>
      putState({
        seek: Math.round(position),
        playing: null,
        volume: null,
        next: false,
      }),
    onMutate(position) {
      let oldBotData = queryCache.getQueryData<BotData>(BOT_STORE_KEY);
      if (!oldBotData) {
        return;
      }
      const newBotData: BotData = {
        ...oldBotData,
        position,
      };
      queryCache.setQueryData(BOT_STORE_KEY, newBotData);
      queryCache.cancelQueries({ key: BOT_STORE_KEY });

      return {
        newBotData,
        oldBotData,
      };
    },

    onError(err, _title, { oldBotData, newBotData }) {
      // before applying the rollback, we need to check if the value in the cache is the same
      // because the cache could have been updated by another mutation or query
      if (newBotData === queryCache.getQueryData(BOT_STORE_KEY)) {
        queryCache.setQueryData(BOT_STORE_KEY, oldBotData);
      } else {
        queryCache.invalidateQueries({ key: BOT_STORE_KEY });
      }

      // handle the error
      console.error("An error occurred when seeking:", err);
    },

    onSuccess(newState: BotData) {
      if (newState.position) {
        queryCache.setQueryData(BOT_STORE_KEY, newState);
      } else {
        queryCache.invalidateQueries({ key: BOT_STORE_KEY });
      }
    },
  });
});

export const useSetPlaying = defineMutation(() => {
  const queryCache = useQueryCache();
  useMutation({
    mutation: (doPlay: boolean) =>
      putState({ playing: doPlay, volume: null, seek: null, next: false }),
    onMutate(doPlay) {
      let oldBotData = queryCache.getQueryData<BotData>(BOT_STORE_KEY);
      if (!oldBotData) {
        return;
      }
      const newBotData: BotData = {
        ...oldBotData,
        state: doPlay ? "Playing" : "Paused",
      };
      queryCache.setQueryData(BOT_STORE_KEY, newBotData);
      queryCache.cancelQueries({ key: BOT_STORE_KEY });

      return {
        newBotData,
        oldBotData,
        doPlay,
      };
    },

    onError(err, _title, { oldBotData, newBotData }) {
      // before applying the rollback, we need to check if the value in the cache is the same
      // because the cache could have been updated by another mutation or query
      if (newBotData === queryCache.getQueryData(BOT_STORE_KEY)) {
        queryCache.setQueryData(BOT_STORE_KEY, oldBotData);
      } else {
        queryCache.invalidateQueries({ key: BOT_STORE_KEY });
      }

      // handle the error
      console.error("An error occurred when changing playback state:", err);
    },

    onSuccess(newState: BotData, _vars, {}: { newBotData: BotData }) {
      queryCache.setQueryData(BOT_STORE_KEY, newState);
    },
  });
});

export const useSetNext = defineMutation(() => {
  const queryCache = useQueryCache();
  useMutation({
    mutation: () =>
      putState({ next: true, playing: null, volume: null, seek: null }),
    onMutate() {
      let oldBotData = queryCache.getQueryData<BotData>(BOT_STORE_KEY);
      if (!oldBotData) {
        return;
      }

      let currentPlaylist =
        queryCache.getQueryData<AudioMetadata[]>(CURRENT_STORE_KEY);

      const newBotData: BotData = {
        ...oldBotData,
        currently_playing: currentPlaylist?.at(0) ?? null,
      };
      queryCache.setQueryData(BOT_STORE_KEY, newBotData);
      queryCache.cancelQueries({ key: BOT_STORE_KEY });

      return {
        newBotData,
        oldBotData,
      };
    },

    onSettled() {
      queryCache.invalidateQueries({ key: CURRENT_STORE_KEY });
    },

    onError(err, _title, { oldBotData, newBotData }) {
      if (newBotData === queryCache.getQueryData(BOT_STORE_KEY)) {
        queryCache.setQueryData(BOT_STORE_KEY, oldBotData);
      } else {
        queryCache.invalidateQueries({ key: BOT_STORE_KEY });
      }

      console.error("An error occurred when skipping to next track:", err);
    },

    onSuccess(newState: BotData, _vars, {}: { newBotData: BotData }) {
      queryCache.setQueryData(BOT_STORE_KEY, newState);
    },
  });
});

export const usePostBot = defineMutation(() => {
  const queryCache = useQueryCache();
  return useMutation({
    mutation: () => postBot(),
    onMutate() {
      if (queryCache.getQueryData(BOT_STORE_KEY)) {
        return;
      }

      const newBotData: BotData = {
        name: "PokeBot",
        state: "EndOfStream",
        volume: 0.3,
        position: 0,
        currently_playing: null,
        playlist: [],
      };
      queryCache.setQueryData(BOT_STORE_KEY, newBotData);
      queryCache.cancelQueries({ key: BOT_STORE_KEY });

      return {
        newBotData,
      };
    },

    onSettled() {
      queryCache.invalidateQueries({ key: CURRENT_STORE_KEY });
    },

    onError(err, _title, { newBotData }) {
      if (newBotData === queryCache.getQueryData(BOT_STORE_KEY)) {
        queryCache.setQueryData(BOT_STORE_KEY, null);
      } else {
        queryCache.invalidateQueries({ key: BOT_STORE_KEY });
      }

      console.error("An error occurred when creating a bot:", err);
    },
  });
});

export const useSetFavourite = defineMutation(() => {
  const queryCache = useQueryCache();
  return useMutation({
    mutation: ({
      songId,
      doFavourite,
    }: {
      songId: number;
      doFavourite: boolean;
    }) => {
      if (doFavourite) {
        return postFavourite(songId);
      } else {
        return deleteFavourite(songId);
      }
    },
    onMutate({ songId, doFavourite }) {
      let oldFavs =
        queryCache.getQueryData<Favourite[]>(FAVOURITE_STORE_KEY) ?? [];
      const oldAlbums = queryCache.getQueryData<Album[]>(ALBUM_STORE_KEY) ?? [];

      let newFavs = [];
      const newAlbums = oldAlbums.map((album) => {
        return {
          ...album,
          songs: album.songs.map((song) =>
            song.id === songId
              ? {
                  ...song,
                  favourite_count:
                    song.favourite_count + (doFavourite ? 1 : -1),
                }
              : song,
          ),
        };
      });

      let newFavourite = null;
      if (doFavourite) {
        newFavourite = {
          id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
          song_id: songId,
          created_at: Date.now(),
        };
        newFavs = [...oldFavs, newFavourite];
      } else {
        newFavs = oldFavs.filter((f) => f.song_id !== songId);
      }
      queryCache.setQueryData(FAVOURITE_STORE_KEY, newFavs);
      queryCache.cancelQueries({ key: FAVOURITE_STORE_KEY });
      queryCache.setQueryData(ALBUM_STORE_KEY, newAlbums);
      queryCache.cancelQueries({ key: ALBUM_STORE_KEY });

      return {
        newFavs,
        oldFavs,
        oldAlbums,
        newAlbums,
        doFavourite,
      };
    },

    onError(err, _title, { oldFavs, newFavs, oldAlbums, newAlbums }) {
      // before applying the rollback, we need to check if the value in the cache is the same
      // because the cache could have been updated by another mutation or query
      if (newFavs === queryCache.getQueryData(FAVOURITE_STORE_KEY)) {
        queryCache.setQueryData(FAVOURITE_STORE_KEY, oldFavs);
      } else {
        queryCache.invalidateQueries({ key: FAVOURITE_STORE_KEY });
      }

      if (newAlbums === queryCache.getQueryData(ALBUM_STORE_KEY)) {
        queryCache.setQueryData(ALBUM_STORE_KEY, oldAlbums);
      } else {
        queryCache.invalidateQueries({ key: ALBUM_STORE_KEY });
      }

      // handle the error
      console.error("An error occurred when modifying a favourite:", err);
    },

    onSuccess(fav: Favourite, _vars, { doFavourite }) {
      if (!doFavourite) {
        return;
      }
      let favourites =
        queryCache.getQueryData<Favourite[]>(FAVOURITE_STORE_KEY) ?? [];
      const favouriteIndex = favourites.findIndex(
        (f) => f.song_id === fav.song_id,
      );
      if (favouriteIndex === -1) {
        console.log("favourite not found");
        queryCache.invalidateQueries({ key: FAVOURITE_STORE_KEY });
        return;
      }
      const copy = favourites.slice();
      copy.splice(favouriteIndex, 1, fav);
      queryCache.setQueryData(FAVOURITE_STORE_KEY, copy);
    },
  });
});
