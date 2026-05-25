<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import Album from "@/components/AlbumPane.vue";
import { PLAYLIST_STORE_KEY } from "@/main";

const {
	state: playlists,
	asyncStatus,
	refresh,
} = useQuery({
	key: PLAYLIST_STORE_KEY,
	query: async function getPlaylists(): Promise<number[]> {
		return [];
	},
});
</script>

<template>
    <div v-if="asyncStatus === 'loading'">
        Loading...
    </div>
    <div v-if="playlists.error">
        Error: {{ playlists.error }}
    </div>
    <div v-else-if="playlists.data" class="available">
        <input id="search" placeholder="Search" />
        <li class="playlists" v-for="playlist in playlists.data" :key="playlist">
            placeholder
        </li>
    </div>
</template>

<style scoped>
    #search {
        width: 100%;
        margin: 15px 0px;
    }
    li {
        list-style-type: none;
    }
</style>
