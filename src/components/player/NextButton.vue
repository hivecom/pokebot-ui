<script setup lang="ts">
import { useSetNext } from "@/store/mutations";
import IconNext from "../icons/IconNext.vue";

const { mutate: setNext } = useSetNext();
</script>

<template>
  <IconNext @click="setNext()"/>
</template>

<style scoped>
svg {
    width: 30px;
    height: 30px;
    fill: white;
    cursor: pointer;
}
</style>
