<script setup lang="ts">
import { useQuery, useQueryCache } from "@pinia/colada";
import { ref, watch } from "vue";
import { URL_ROOT } from "@/api/request";
import { getFiles, putMetadata } from "@/api/song";
import { ALBUM_STORE_KEY, AUDIO_FILE_STORE_KEY } from "@/main";
import type { UploadResponse } from "@/types/UploadResponse";

const { uploaded } = defineProps<{
	uploaded: UploadResponse[];
}>();

const emit =
	defineEmits<(e: "update:uploaded", value: UploadResponse[]) => void>();

const { state: audioFiles } = useQuery({
	key: AUDIO_FILE_STORE_KEY,
	query: getFiles,
});

const editable = ref<UploadResponse[]>([]);

watch(
	() => uploaded,
	(newSongs) => {
		editable.value = newSongs;
	},
	{ immediate: true },
);

const queryCache = useQueryCache();
async function updateMetadata() {
	await Promise.all(
		editable.value.map((ul) => {
			if (!ul.metadata.title || !ul.metadata.artist) {
				return Promise.resolve();
			}
			return putMetadata(ul.file_id, {
				track: ul.metadata.track,
				title: ul.metadata.title,
				artist: ul.metadata.artist,
				album: ul.metadata.album,
				disc_number: ul.metadata.disc_number,
				cover_path: ul.metadata.cover_path,
			});
		}),
	);
	emit("update:uploaded", []);
	queryCache.invalidateQueries({ key: ALBUM_STORE_KEY });
}
</script>

<template>
    <form class="editor" @submit.prevent="updateMetadata">
        <h2>Metadata</h2>
        <p>Enter or correct any missing metadata.</p>
        <div class="song" v-for="resp in editable" :key="resp.file_id">
            <h3>{{audioFiles.data?.find(f => f.id === resp.file_id)?.file_name}}</h3>
            <label>
                <div class="label">Track</div>
                <input type="number" placeholder="Track Number" v-model.number="resp.metadata.track"/>
            </label>
            <label>
                <div class="label">Title</div>
                <input type="text" placeholder="Titel" v-model="resp.metadata.title"/>
            </label>
            <label>
                <div class="label">Artist</div>
                <input type="text" placeholder="Artist" v-model="resp.metadata.artist"/>
            </label>
            <label>
                <div class="label">Album</div>
                <input type="text" placeholder="Album" v-model="resp.metadata.album"/>
            </label>
            <label>
                <div class="label">Disc</div>
                <input type="text" placeholder="Disc Number" v-model="resp.metadata.disc_number"/>
            </label>
            <!-- <img :src="`${URL_ROOT}/${(resp.metadata.cover_path ?? undefined)}`"/> -->
            <hr/>
        </div>
        <button>Submit</button>
    </form>
</template>

<style lang="css" scoped>
.editor {
    position:absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 10px;

    background-color: var(--dark-color-bg);
    border: 1px solid var(--dark-color-border-weak);

    display: flex;
    flex-direction: column;
    padding: 10px;

    overflow-y: scroll;
    max-height: 90vh;

    z-index: 50;

    p {
        margin-bottom: 30px;
    }

    label {
        display:flex;
        flex-direction: column;
        position: relative;

        .label {
            position: absolute;
            font-size: 10px;
            top: -10%;
            left: 10px;
            z-index: 1;
            color: var(--dark-color-accent);

            &::before {
                content: "";
                position: absolute;
                z-index: -1;

                width: calc(100% + 4px);
                height: 10px;
                left: calc(0% - 2px);
                top: -5px;

                background-color: var(--dark-color-bg);
            }
        }
    }

    hr {
        color: var(--dark-color-border-weak);
    }

    input {
        background-color: var(--dark-color-fg);
        border: 1px solid var(--dark-color-border-weak);
    }

    button {
        align-self: flex-end;
    }

    .song {
        display:flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 30px;
        width: 500px;
    };
}
</style>
