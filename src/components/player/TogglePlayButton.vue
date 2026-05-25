<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { computed } from "vue";
import { getBotData } from "@/api/botData";
import { BOT_STORE_KEY } from "@/main";
import { useSetPlaying } from "@/store/mutations";
import IconPause from "../icons/IconPause.vue";
import IconPlay from "../icons/IconPlay.vue";

const { state: botState } = useQuery({
	key: BOT_STORE_KEY,
	query: getBotData,
});

const { mutate: setPlaying } = useSetPlaying();

const playing = computed(() => {
	return botState.value.data?.state === "Playing";
});
</script>

<template>
  <IconPause @click="setPlaying(false)" v-if="playing" />
  <IconPlay @click="setPlaying(true)" v-else />
</template>

<style scoped>
svg {
    width: 30px;
    height: 30px;
    fill: white;
    cursor: pointer;
}
</style>
