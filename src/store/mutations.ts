import { useQueryCache, defineMutation, useMutation } from "@pinia/colada";
import { postSong } from "@/api/current";
import {
  AUDIO_FILE_STORE_KEY,
  BOT_STORE_KEY,
  CURRENT_STORE_KEY,
  FAVOURITE_STORE_KEY,
} from "@/main";
import type { AudioMetadata } from "@/types/AudioMetadata";
import type { BotData } from "@/types/BotData";
import type { Song } from "@/types/Song";
import { putState } from "@/api/botData";
import type { AudioFile } from "@/types/AudioFile";
import { deleteFavourite, postFavourite } from "@/api/favourite";
import type { Favourite } from "@/types/Favourite";

export const usePlaySong = defineMutation(() => {
  const queryCache = useQueryCache();
  const mutation = useMutation({
    mutation: (song: Song) => postSong(song.id),
    onMutate(song) {
      let files = queryCache.getQueryData<AudioFile[]>(AUDIO_FILE_STORE_KEY);
      let newItem: AudioMetadata = {
        id: 0,
        url: files?.find((f) => f.id === song.file_id)?.file_path ?? "",
        title: song.title,
        webpage_url: null,
        artist: song.artist,
        album: song.album,
        thumbnail: null,
        duration: files?.find((f) => f.id === song.file_id)?.duration ?? 0,
      };

      let oldData = queryCache.getQueryData<BotData>(BOT_STORE_KEY);
      if (oldData && !oldData.currently_playing) {
        const newData = { ...oldData, currently_playing: newItem };
        queryCache.setQueryData(BOT_STORE_KEY, newData);
        queryCache.cancelQueries({ key: BOT_STORE_KEY });

        return {
          newPlaylist: null,
          oldPlaylist: null,
          newData,
          oldData,
          newItem,
        };
      } else {
        let oldPlaylist =
          queryCache.getQueryData<AudioMetadata[]>(CURRENT_STORE_KEY);
        if (!oldPlaylist) {
          oldPlaylist = [];
        }
        newItem.id = Math.max(...oldPlaylist.map((a) => a.id));
        if (newItem.id === -Infinity) {
          newItem.id = 0;
        }
        const newPlaylist: AudioMetadata[] = [...oldPlaylist, newItem];
        queryCache.setQueryData(CURRENT_STORE_KEY, newPlaylist);
        queryCache.cancelQueries({ key: CURRENT_STORE_KEY });

        return {
          newPlaylist,
          oldPlaylist,
          newData: null,
          oldData: null,
          newItem,
        };
      }
    },

    // on both error and success
    onSettled() {
      queryCache.invalidateQueries({ key: CURRENT_STORE_KEY });
    },

    onError(err, _title, { oldPlaylist, newPlaylist, oldData, newData }) {
      if (newPlaylist === queryCache.getQueryData(CURRENT_STORE_KEY)) {
        queryCache.setQueryData(CURRENT_STORE_KEY, oldPlaylist);
      }
      if (newData === queryCache.getQueryData(BOT_STORE_KEY)) {
        queryCache.setQueryData(BOT_STORE_KEY, oldData);
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
        queryCache.getQueryData<AudioMetadata[]>(CURRENT_STORE_KEY) || [];
      const songIndex = playlist.findIndex((t) => t.id === newItem.id);
      if (songIndex >= 0) {
        const copy = playlist.slice();
        copy.splice(songIndex, 1, playlistItem);
        queryCache.setQueryData(CURRENT_STORE_KEY, copy);
      }
    },
  });

  return mutation;
});

export const useSetSeek = defineMutation(() => {
  const queryCache = useQueryCache();
  const mutation = useMutation({
    mutation: (position: number) =>
      putState({
        seek: Math.round(position),
        playing: null,
        volume: null,
        next: false,
      }),
    onMutate(position) {
      let oldData = queryCache.getQueryData<BotData>(BOT_STORE_KEY);
      if (!oldData) {
        console.log("oldData is undefined??");
        return;
      }
      const newData: BotData = {
        ...oldData,
        position,
      };
      queryCache.setQueryData(BOT_STORE_KEY, newData);
      queryCache.cancelQueries({ key: BOT_STORE_KEY });

      return {
        newData,
        oldData,
      };
    },

    onError(err, _title, { oldData, newData }) {
      // before applying the rollback, we need to check if the value in the cache is the same
      // because the cache could have been updated by another mutation or query
      if (newData === queryCache.getQueryData(BOT_STORE_KEY)) {
        queryCache.setQueryData(BOT_STORE_KEY, oldData);
      } else {
        queryCache.invalidateQueries({ key: BOT_STORE_KEY });
      }

      // handle the error
      console.error("An error occurred when adding a song:", err);
    },

    onSuccess(newState: BotData) {
      if (newState.position) {
        queryCache.setQueryData(BOT_STORE_KEY, newState);
      } else {
        queryCache.invalidateQueries({ key: BOT_STORE_KEY });
      }
    },
  });

  return mutation;
});

export const useSetPlaying = defineMutation(() => {
  const queryCache = useQueryCache();
  const mutation = useMutation({
    mutation: (doPlay: boolean) =>
      putState({ playing: doPlay, volume: null, seek: null, next: false }),
    onMutate(doPlay) {
      let oldData = queryCache.getQueryData<BotData>(BOT_STORE_KEY);
      if (!oldData) {
        console.log("oldData is undefined??");
        return;
      }
      const newData: BotData = {
        ...oldData,
        state: doPlay ? "Playing" : "Paused",
      };
      queryCache.setQueryData(BOT_STORE_KEY, newData);
      queryCache.cancelQueries({ key: BOT_STORE_KEY });

      return {
        newData,
        oldData,
        doPlay,
      };
    },

    onError(err, _title, { oldData, newData }) {
      // before applying the rollback, we need to check if the value in the cache is the same
      // because the cache could have been updated by another mutation or query
      if (newData === queryCache.getQueryData(BOT_STORE_KEY)) {
        queryCache.setQueryData(BOT_STORE_KEY, oldData);
      } else {
        queryCache.invalidateQueries({ key: BOT_STORE_KEY });
      }

      // handle the error
      console.error("An error occurred when adding a song:", err);
    },

    onSuccess(newState: BotData, _vars, {}: { newData: BotData }) {
      queryCache.setQueryData(BOT_STORE_KEY, newState);
    },
  });

  return mutation;
});

export const useSetNext = defineMutation(() => {
  const queryCache = useQueryCache();
  const mutation = useMutation({
    mutation: () =>
      putState({ next: true, playing: null, volume: null, seek: null }),
    onMutate() {
      let currentPlaylist =
        queryCache.getQueryData<AudioMetadata[]>(CURRENT_STORE_KEY);

      let oldData = queryCache.getQueryData<BotData>(BOT_STORE_KEY);
      if (!oldData) {
        console.log("oldData is undefined");
        return;
      }
      const newData: BotData = {
        ...oldData,
        currently_playing: currentPlaylist?.at(0) ?? null,
      };
      queryCache.setQueryData(BOT_STORE_KEY, newData);
      queryCache.cancelQueries({ key: BOT_STORE_KEY });

      return {
        newData,
        oldData,
      };
    },

    onSettled() {
      queryCache.invalidateQueries({ key: CURRENT_STORE_KEY });
    },

    onError(err, _title, { oldData, newData }) {
      if (newData === queryCache.getQueryData(BOT_STORE_KEY)) {
        queryCache.setQueryData(BOT_STORE_KEY, oldData);
      } else {
        queryCache.invalidateQueries({ key: BOT_STORE_KEY });
      }

      console.error("An error occurred when adding a song:", err);
    },

    onSuccess(newState: BotData, _vars, {}: { newData: BotData }) {
      queryCache.setQueryData(BOT_STORE_KEY, newState);
    },
  });

  return mutation;
});

export const useSetFavourite = defineMutation(() => {
  const queryCache = useQueryCache();
  const mutation = useMutation({
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
      let oldData =
        queryCache.getQueryData<Favourite[]>(FAVOURITE_STORE_KEY) ?? [];

      let newData = [];
      let newFavourite = null;
      if (doFavourite) {
        newFavourite = {
          id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
          song_id: songId,
          created_at: Date.now(),
        };
        newData = [...oldData, newFavourite];
      } else {
        newData = oldData.filter((f) => f.song_id !== songId);
      }
      queryCache.setQueryData(FAVOURITE_STORE_KEY, newData);
      queryCache.cancelQueries({ key: FAVOURITE_STORE_KEY });

      return {
        newData,
        oldData,
        doFavourite,
      };
    },

    onError(err, _title, { oldData, newData }) {
      // before applying the rollback, we need to check if the value in the cache is the same
      // because the cache could have been updated by another mutation or query
      if (newData === queryCache.getQueryData(BOT_STORE_KEY)) {
        queryCache.setQueryData(FAVOURITE_STORE_KEY, oldData);
      } else {
        queryCache.invalidateQueries({ key: FAVOURITE_STORE_KEY });
      }

      // handle the error
      console.error("An error occurred when adding a song:", err);
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

  return mutation;
});
