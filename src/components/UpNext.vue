<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { onMounted } from "vue";
import { getAlbums } from "@/api/current.ts";
import { CURRENT_STORE_KEY } from "@/main";
import { usePostBot } from "@/store/mutations";
import { formatDuration } from "@/util";

const {
	state: currentlyPlaying,
	asyncStatus,
	refresh,
} = useQuery({
	key: CURRENT_STORE_KEY,
	query: getAlbums,
});

let refreshTimer: ReturnType<typeof setInterval>;
onMounted(() => {
	refreshTimer = setInterval(() => {
		refresh();
	}, 10000);
});

let { mutate: postBot } = usePostBot();
</script>

<template>
    <div class="up-next">
        <div v-if="asyncStatus === 'loading'">
            Loading...
        </div>
        <div class="error" v-if="currentlyPlaying.error">
            No bot in your channel
            <button @click="() => postBot()">Request Bot</button>
        </div>
        <template v-else-if="currentlyPlaying.data">
            <div class="top">
                <div class="left">
                    <h1>Up Next</h1>
                    <div>Loop</div>
                    <div>Shuffle</div>
                </div>
                <button>Save Playlist</button>
            </div>
            <div class="overflow">
                <table class="current">
                    <colgroup>
                        <col class="index-group" span="1">
                    </colgroup>
                    <thead>
                        <tr>
                            <td class="index">#</td>
                            <td class="name">Name</td>
                            <td class="album">Album</td>
                            <td class="artist">Artist</td>
                            <td class="duration">Duration</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(song, index) in currentlyPlaying.data" :key="song.id">
                            <!-- TODO: should be hearts -->
                            <td class="index">{{index + 1}}.</td>
                            <th class="name" scope="row">
                                {{song.title}}
                            </th>

                            <td class="album">
                                {{song.album}}
                            </td>
                            <td class="artist">
                                {{song.artist}}
                            </td>

                            <td class="duration">
                                {{formatDuration(song.duration)}}
                            </td>
                            <!-- <td>{{ item.added_by }}</td> -->
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </div>
</template>

<style scoped>
.up-next {
    .error {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .top {
        display: flex;
        margin-bottom: 20px;
        justify-content: space-between;
        align-items: center;

        .left {
            display:flex;
            align-items: flex-end;
            gap: 10px;
        }
    }

    .overflow {
        height: calc(100% - 60px);
        overflow-y: auto;
    }
}
</style>
