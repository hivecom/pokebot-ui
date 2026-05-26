<script setup lang="ts">
import { useQuery, useQueryCache } from "@pinia/colada";
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { getBotData } from "@/api/botData";
import { URL_ROOT } from "@/api/request";
import { BOT_STORE_KEY, CURRENT_STORE_KEY } from "@/main";
import { useSetSeek } from "@/store/mutations";
import { formatDuration } from "@/util";
import IconDefaultCover from "../icons/IconDefaultCover.vue";
import NextButton from "./NextButton.vue";
import TogglePlayButton from "./TogglePlayButton.vue";

const { state: botState, refresh } = useQuery({
	key: BOT_STORE_KEY,
	query: getBotData,
});

const currentURL = computed(() => {
	return botState.value.data?.currently_playing?.url.startsWith("http")
		? botState.value.data?.currently_playing.url
		: undefined;
});

const currentMillisecond = ref(botState.value.data?.position);

watch(botState, async (newState) => {
	currentMillisecond.value = newState.data?.position;
});

const currentPercentage = computed(() => {
	return botState.value.data?.currently_playing?.duration
		? ((currentMillisecond.value ?? 0) /
				botState.value.data?.currently_playing?.duration) *
				100
		: 0;
});

const queryCache = useQueryCache();
let currentSecondTimer: ReturnType<typeof setInterval>;
let refreshTimer: ReturnType<typeof setInterval>;
let refreshTimer2: ReturnType<typeof setInterval>;
onMounted(() => {
	currentSecondTimer = setInterval(() => {
		if (
			currentMillisecond.value == null ||
			botState.value.data?.state !== "Playing"
		) {
			return;
		}

		if (
			currentMillisecond.value <
			(botState.value.data?.currently_playing?.duration ?? 0)
		) {
			currentMillisecond.value += 16;
		} else {
			refresh();
			queryCache.invalidateQueries({ key: CURRENT_STORE_KEY });
		}
	}, 16);

	refreshTimer = setInterval(() => {
		refresh();
	}, 5000);
	refreshTimer2 = setInterval(() => {
		if (
			botState.value.data?.state === "EndOfStream" &&
			botState.value.data.currently_playing
		) {
			refresh();
		}
	}, 100);
});
onBeforeMount(() => {
	if (currentSecondTimer) {
		clearInterval(currentSecondTimer);
	}
	if (refreshTimer) {
		clearInterval(refreshTimer);
	}
	if (refreshTimer2) {
		clearInterval(refreshTimer2);
	}
});

const { mutate: setSeek } = useSetSeek();

function clicked(event: PointerEvent) {
	setSeek(
		(event.offsetX / (<HTMLProgressElement>event.target).clientWidth) *
			(botState.value.data?.currently_playing?.duration ?? 0),
	);
}
</script>

<template>
    <div class="player" v-if="!botState.error && botState.data && botState.data.currently_playing">
        <div class="left">
            <a :href="currentURL">
                {{ botState.data.currently_playing?.title ?? "Unknown Title" }}
                <template v-if="botState.data.currently_playing?.artist">
                    - {{botState.data.currently_playing?.artist}}
                </template>
            </a>
            <div class="controls">

                <!-- <h2>{{ bot.name }}</h1> -->
                <!-- <div>Volume: {{ bot.volume * 100.0 }}%</div> -->
                <TogglePlayButton/>
                <NextButton/>
                <progress @click="clicked" :value="currentPercentage" max="100" id="seekbar"></progress>

                <div class="time">
                    {{ formatDuration(currentMillisecond ?? null) }} / {{ formatDuration(botState.data.currently_playing?.duration ?? null) }}
                </div>
            </div>
        </div>
        <IconDefaultCover class="cover"/>
    </div>
</template>

<style scoped>
.player {
    display: flex;
    background-color: var(--dark-color-fg);

    .left {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        padding: 10px;
    }

    .controls {
        display: flex;
        gap: 10px;
        align-items: center;

        button {
            background-color: transparent;
            border: none;
        }

        progress {
            flex: 1;
            height: 8px;
            border-radius: 10px;
            border: none;
            cursor: pointer;

            &[value] {
                background-color: var(--dark-color-bg-accent-lowered);
                &::-webkit-progress-bar {
                    background-color: var(--dark-color-bg-accent-lowered);
                    border-radius: 10px;
                }

                &::-moz-progress-bar {
                    background-color: var(--dark-color-accent);
                    border-radius: 10px;
                }

                &::-webkit-progress-value {
                    background-color: var(--dark-color-accent);
                    border-radius: 10px;
                }
            }
        }
    }

    .cover {
        width: 100px;
        height: 100px;
    }
}
</style>
