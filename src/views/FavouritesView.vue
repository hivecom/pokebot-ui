<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { computed, ref } from "vue";
import { getFavourites } from "@/api/favourite";
import { getFiles, getSongs } from "@/api/song";
import FavouriteButton from "@/components/FavouriteButton.vue";
import MyContextMenu from "@/components/MyContextMenu.vue";
import {
	AUDIO_FILE_STORE_KEY,
	FAVOURITE_STORE_KEY,
	SONG_STORE_KEY,
} from "@/main";
import { usePlaySong } from "@/store/mutations";
import { formatDuration } from "@/util";

const { state: audioFiles } = useQuery({
	key: AUDIO_FILE_STORE_KEY,
	query: getFiles,
});

const { state: songs, asyncStatus } = useQuery({
	key: SONG_STORE_KEY,
	query: getSongs,
});

const { state: favourites } = useQuery({
	key: FAVOURITE_STORE_KEY,
	query: getFavourites,
});

const search = ref("");

const favouritedSongs = computed(() => {
	if (!favourites.value.data || !songs.value.data) return [];

	const lfilter = search.value.toLowerCase();
	return songs.value.data.filter(
		(s) =>
			(lfilter === "" ||
				s.title.toLowerCase().includes(lfilter) ||
				s.artist.toLowerCase().includes(lfilter) ||
				(s.album && s.album.toLowerCase().includes(lfilter))) &&
			favourites.value.data?.some((f) => f.song_id === s.id),
	);
});

const { mutate: playSong } = usePlaySong();

const editorFileId = ref<number | null>(null);

const menuVisible = ref(false);
const contextPosition = ref({ x: 0, y: 0 });

const onContextMenu = (e: MouseEvent, fileId: number) => {
	// Prevent the browser's default right-click menu from opening
	e.preventDefault();

	// Update coordinates to where the mouse clicked
	contextPosition.value.x = e.clientX;
	contextPosition.value.y = e.clientY;

	// Show the menu
	menuVisible.value = true;
	editorFileId.value = fileId;
};
</script>

<template>
    <div v-if="asyncStatus === 'loading'">
        Loading...
    </div>
    <div v-if="songs.error">
        Error: {{ songs.error }}
    </div>
    <div v-else-if="songs.data" class="favourites">
        <input v-model="search" id="search" placeholder="Search" />
            <table>
            <colgroup>
                <col class="col-num">
                <col class="col-name">
                <col class="col-likes">
                <col class="col-duration">
              </colgroup>
                <tbody>
                    <tr class="song" @click="playSong(song)" v-for="song in favouritedSongs" :key="song.id" @contextmenu="onContextMenu($event, song.file_id)">
                        <td class="number" v-if="song.track">{{song.track}}.</td>
                        <td class="number" v-else></td>
                        <th class="name" scope="row">{{song.title}}</th>
                        <td class="likes">{{song.favourite_count}} <FavouriteButton :songId="song.id"/></td>
                        <td class="duration">{{formatDuration(audioFiles.data?.find(f => f.id === song.file_id)?.duration ?? null)}}</td>
                    </tr>
                </tbody>
            </table>
    </div>
    <MyContextMenu :pos="contextPosition" v-model:menuVisible="menuVisible" :editorFileId="editorFileId"/>
</template>

<style scoped>
.favourites {
    overflow-y: auto;

    #search {
        width: 100%;
        margin: 15px 0px;
    }
    li {
        list-style-type: none;
    }
    .song {
        cursor: pointer;
    }
    .likes {
        display: flex;
        align-items: center;
        justify-content: flex-end;
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
