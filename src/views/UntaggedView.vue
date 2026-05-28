<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { computed, ref } from "vue";
import { getFiles, getSongs } from "@/api/song";
import MyContextMenu from "@/components/MyContextMenu.vue";
import { AUDIO_FILE_STORE_KEY, SONG_STORE_KEY } from "@/main";
import { usePlaySong } from "@/store/mutations";
import type { AudioFile } from "@/types/AudioFile";
import { formatDuration } from "@/util";

const { state: audioFiles } = useQuery({
	key: AUDIO_FILE_STORE_KEY,
	query: getFiles,
});

const { state: songs, asyncStatus } = useQuery({
	key: SONG_STORE_KEY,
	query: getSongs,
});

const untaggedFiles = computed(() => {
	if (!audioFiles.value.data) return [];

	const lfilter = search.value.toLowerCase();
	return audioFiles.value.data.filter(
		(f) =>
			songs.value.data?.every((s) => s.file_id !== f.id) &&
			f.file_name.toLowerCase().includes(lfilter),
	);
});

const search = ref("");

const { mutate: playSong } = usePlaySong();

function playFile(file: AudioFile) {
	playSong({
		id: file.id,
		file_id: file.id,
		track: null,
		title: file.file_name,
		artist: "Unknown Artist",
		album: null,
		favourite_count: 0,
		created_at: file.created_at,
	});
}

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
                <col class="col-name">
                <col class="col-duration">
            </colgroup>
            <tbody>
                <tr class="song" @click="playFile(file)" v-for="file in untaggedFiles" :key="file.id" @contextmenu="onContextMenu($event, file.id)">
                    <td class="name" v-if="file.file_name">{{file.file_name}}</td>
                    <td class="duration">{{formatDuration(file.duration)}}</td>
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
