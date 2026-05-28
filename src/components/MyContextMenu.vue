
<script setup lang="ts">
import { ContextMenu, ContextMenuItem } from "@imengyu/vue3-context-menu";
import { useQuery } from "@pinia/colada";
import { ref, watch } from "vue";
import { getFiles, getSongs } from "@/api/song";
import { AUDIO_FILE_STORE_KEY, SONG_STORE_KEY } from "@/main";
import type { UploadResponse } from "@/types/UploadResponse";
import MetadataEditor from "./MetadataEditor.vue";

const { pos, menuVisible, editorFileId } = defineProps<{
	pos: { x: number; y: number };
	menuVisible: boolean;
	editorFileId: number | null;
}>();

const emit = defineEmits<(e: "update:menuVisible", value: boolean) => void>();

const { state: audioFiles } = useQuery({
	key: AUDIO_FILE_STORE_KEY,
	query: getFiles,
});

const { state: songs } = useQuery({
	key: SONG_STORE_KEY,
	query: getSongs,
});

const editorData = ref<UploadResponse[]>([]);

const openEditor = () => {
	if (!editorFileId) {
		return;
	}
	emit("update:menuVisible", false);

	if (!editorFileId) {
		editorData.value = [];
		return;
	}

	const meta = songs.value.data?.find((s) => s.file_id === editorFileId) ?? {
		track: null,
		title: null,
		artist: null,
		album: null,
	};
	editorData.value = [
		{
			file_id: editorFileId,
			metadata: { ...meta, cover_path: null, duration: 0 },
		},
	];
};
</script>

<template>
    <MetadataEditor v-if="editorData.length > 0" v-model:uploaded="editorData"/>
    <ContextMenu :show="menuVisible" @update:show="$emit('update:menuVisible', $event)" :options="pos">
        <ContextMenuItem @click="openEditor" label="Edit Metadata" />
    </ContextMenu>
</template>

<style scoped>
</style>
