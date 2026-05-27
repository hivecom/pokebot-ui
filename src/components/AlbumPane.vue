<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { computed } from "vue";
import { URL_ROOT } from "@/api/request";
import { getFiles } from "@/api/song";
import { AUDIO_FILE_STORE_KEY } from "@/main";
import { usePlaySong } from "@/store/mutations";
import type { Album } from "@/types/Album";
import { formatDuration } from "@/util";
import FavouriteButton from "./FavouriteButton.vue";
import IconDefaultCover from "./icons/IconDefaultCover.vue";

const { album, filter } = defineProps<{
	album: Album;
	filter: string;
}>();

const { state: audioFiles } = useQuery({
	key: AUDIO_FILE_STORE_KEY,
	query: getFiles,
});

const filteredSongs = computed(() => {
	if (filter !== "") {
		const lfilter = filter.toLowerCase();
		return album.songs.filter(
			(s) =>
				s.title.toLowerCase().includes(lfilter) ||
				s.artist.toLowerCase().includes(lfilter) ||
				(s.album && s.album.toLowerCase().includes(lfilter)),
		);
	} else {
		return album.songs;
	}
});

const totalDuration = computed(() => {
	return album.songs.reduce(
		(acc, a) =>
			acc +
			(audioFiles.value.data?.find((f) => f.id === a.file_id)?.duration ?? 0),
		0,
	);
});

const { mutate: playSong } = usePlaySong();
</script>

<template>
    <div class="album" v-if="filteredSongs.length > 0">
        <div class="head">
            <img v-if="album.cover" :src="`${URL_ROOT}/${album.cover}`" class="cover"/>
            <IconDefaultCover v-else class="cover" />
            <div class="info">
                <div class="album-title">{{album.title}}</div>
                <div class="artist">{{album.artist}}</div>
                <div class="bottom">
                    <div class="track-count">{{album.songs.length}} Tracks</div>
                    <div class="time">Time: {{formatDuration(totalDuration)}}</div>
                </div>
            </div>
        </div>
        <table>
            <colgroup>
                <col class="col-num">
                <col class="col-name">
                <col class="col-likes">
                <col class="col-duration">
              </colgroup>
            <tbody>
                <tr class="song" @click="playSong(song)" v-for="song in filteredSongs" :key="song.id">
                    <td class="number" v-if="song.track">{{song.track}}.</td>
                    <td class="number" v-else></td>
                    <th class="name" scope="row">{{song.title}}</th>
                    <td class="likes">{{song.favourite_count}} <FavouriteButton :songId="song.id"/></td>
                    <td class="duration">{{formatDuration(audioFiles.data?.find(f => f.id === song.file_id)?.duration ?? null)}}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.album {
    margin-right: 5px;

    .song {
        cursor: pointer;
    }

    .likes {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 60px;
    }
    .head {
        display: flex;
        gap: 10px;
        border-bottom: 1px solid var(--dark-color-border-weak);
        margin-bottom: 10px;
        background-color: var(--dark-color-fg);

        .cover {
            width: 85px;
            height: 85px;
        }

        .info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .album-title {
                font-size: 20px;
            }

            .bottom {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
            }
        }
    }
}
</style>
