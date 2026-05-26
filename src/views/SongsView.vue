<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { ref } from "vue";
import { getAlbums } from "@/api/album.ts";
import AlbumPane from "@/components/AlbumPane.vue";
import { ALBUM_STORE_KEY } from "@/main";

const {
	state: albumList,
	asyncStatus,
	refresh,
} = useQuery({
	key: ALBUM_STORE_KEY,
	query: getAlbums,
});

const search = ref("");
</script>


<template>
    <div v-if="asyncStatus === 'loading'">
        Loading...
    </div>
    <div v-if="albumList.error">
        Error: {{ albumList.error }}
    </div>
    <div v-else-if="albumList.data" class="songs">
        <input id="search" placeholder="Search" v-model="search" />
        <li class="albums">
            <AlbumPane :album="album" :filter="search"  v-for="album in albumList.data" :key="album.id"/>
        </li>
    </div>
</template>

<style scoped>
.songs {
    min-height: 0;
    display: flex;
    flex-direction: column;

    #search {
        width: 100%;
        margin: 15px 0px;
    }

    li {
        list-style-type: none;
    }

    .albums {
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
        scrollbar-width: thin;
    }
}
</style>
