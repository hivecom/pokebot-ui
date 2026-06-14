<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { computed, ref } from "vue";
import { URL_ROOT } from "@/api/request";
import { getFiles, getSongs } from "@/api/song";
import { AUDIO_FILE_STORE_KEY, SONG_STORE_KEY } from "@/main";
import { usePlaySong } from "@/store/mutations";
import type { Album } from "@/types/Album";
import { formatDuration } from "@/util";
import FavouriteButton from "./FavouriteButton.vue";
import IconDefaultCover from "./icons/IconDefaultCover.vue";
import MyContextMenu from "./MyContextMenu.vue";

const { album, filter } = defineProps<{
	album: Album;
	filter: string;
}>();

const { state: audioFiles } = useQuery({
	key: AUDIO_FILE_STORE_KEY,
	query: getFiles,
});

const { state: songs } = useQuery({
	key: SONG_STORE_KEY,
	query: getSongs,
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

const discs = computed(() => {
	const discs = [...new Set(filteredSongs.value.map((s) => s.disc_number))];
	return discs.sort();
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
        <template v-for="disc in discs">
            <div class="disc-separator">
                <span class="disc-text">Disc {{disc}}</span>
            </div>
            <table>
                <colgroup>
                    <col class="col-num">
                    <col class="col-name">
                    <col class="col-likes">
                    <col class="col-duration">
                </colgroup>
                <tbody>
                    <template v-for="song in filteredSongs" :key="song.id">
                        <tr class="song" @click="playSong(song)" @contextmenu="onContextMenu($event, song.file_id)" v-if="song.disc_number === disc">
                            <td class="number" v-if="song.track">{{song.track}}.</td>
                            <td class="number" v-else></td>
                            <th class="name" scope="row">{{song.title}}</th>
                            <td class="likes">{{song.favourite_count}} <FavouriteButton :songId="song.id"/></td>
                            <td class="duration">{{formatDuration(audioFiles.data?.find(f => f.id === song.file_id)?.duration ?? null)}}</td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </template>

        <MyContextMenu :pos="contextPosition" v-model:menuVisible="menuVisible" :editorFileId="editorFileId"/>
    </div>
</template>

<style scoped>


.disc-separator {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    color: var(--dark-color-text);
    opacity: 0.8;

    .disc-text {
        background-color: black;
        z-index: 3;
        padding: 0px 5px;
    }

    &::before {
        content: "";
        display: block;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 0;
        right: 0;
        border-bottom: 1px solid var(--dark-color-bg-accent-lowered);
        opacity: .8;
        z-index: 1;
    }
}

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
