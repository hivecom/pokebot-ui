<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { computed } from "vue";
import { getFavourites } from "@/api/favourite";
import { FAVOURITE_STORE_KEY } from "@/main";
import { useSetFavourite } from "@/store/mutations";
import type { Favourite } from "@/types/Favourite";
import IconHeartFilled from "./icons/IconHeartFilled.vue";
import IconHeartOutline from "./icons/IconHeartOutline.vue";

const { songId } = defineProps<{
	songId: number;
}>();

const { state: favourites } = useQuery({
	key: FAVOURITE_STORE_KEY,
	query: getFavourites,
});

const isFavourited = computed(() => {
	return (
		favourites.value.data?.some((f: Favourite) => f.song_id === songId) ?? false
	);
});

const { mutate: setFavourite } = useSetFavourite();
</script>

<template>
    <IconHeartFilled @click.stop="setFavourite({songId, doFavourite: false})" class="heart filled" v-if="isFavourited"/>
    <IconHeartOutline @click.stop="setFavourite({songId, doFavourite: true})" class="heart" v-else/>
</template>

<style scoped>
.heart {
    color: var(--dark-color-text-lighter);

    &.filled {
        color: var(--dark-color-accent);
    }
}
</style>
