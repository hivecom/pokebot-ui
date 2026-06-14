<script setup lang="ts">
import LoginView from "./components/LoginView.vue";
import PlayerPane from "./components/player/MainPane.vue";
import SplitView from "./components/SplitView.vue";
import { useAuthStore } from "./store/authStore";

const auth = useAuthStore();
</script>

<template>
    <template v-if="auth.token">
        <SplitView/>
        <PlayerPane/>
    </template>
    <LoginView v-else/>
</template>

<style scoped>
</style>
