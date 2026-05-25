<script setup lang="ts">
import { useQueryCache } from "@pinia/colada";
import { ref } from "vue";
import { uploadSong } from "@/api/song";
import { ALBUM_STORE_KEY } from "@/main";
import type { UploadResponse } from "@/types/UploadResponse";
import MetadataEditor from "./MetadataEditor.vue";

const uploaded = ref<UploadResponse[]>([]);
const fileInputKey = ref(0);

const queryCache = useQueryCache();
async function uploadFiles(files: FileList | undefined) {
	if (files) {
		uploaded.value = await Promise.all(Array.from(files).map(uploadSong));
		fileInputKey.value++;
		queryCache.invalidateQueries({ key: ALBUM_STORE_KEY });
	}
}
</script>

<template>
    <form action="/api/upload" method="post" id="upload-song" enctype="multipart/form-data">
      <label className='button upload-songs' htmlFor='upload-songs'>
        Upload
      </label>
        <input 
            :key="fileInputKey" 
            id='upload-songs'
            type="file" 
            name="file" 
            accept="audio/*" 
            required 
            multiple 
            v-on:change="uploadFiles((<HTMLInputElement>$event.target)?.files ?? undefined)"
        />
    </form>
    <MetadataEditor v-if="uploaded.length > 0" v-model:uploaded="uploaded"/>
</template>

<style scoped>
#upload-songs {
    opacity: 0;
    position: absolute;
    width: 0px;
    height: 0px;
    margin: 0px;
    padding: 0px;
    border: 0px;
    z-index: -3;
}
</style>
