<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/store/authStore";

const token = ref("");

function login() {
	const auth = useAuthStore();
	auth.setAuthToken(token.value);
}
</script>

<template>
<div class="login">
    <h1>Login</h1>
    <p>
    Please message PokeBot with "auth" and enter the token it sends you.
    </p>
    <form action="/login" method="POST">
        <input placeholder="Enter auth token" v-model="token">
        <button type="submit" @click.prevent="login">Log in</button>
    </form>
</div>
</template>

<style scoped>
.login {
    margin: auto;
    background-color: var(--dark-color-fg);
    padding: 40px;
    border-radius: 10px;
    width: 500px;

    p {
        margin-top: 30px;
        margin-bottom: 15px;
    }

    form {
        width: 100%;
        display: flex;
        gap: 10px;
        margin-top: 20px;

        input {
            flex: 3;
        }
        button {
            flex: 1;
            background-color: var(--dark-color-bg-accent-raised);
            color: var(--dark-color-fg);
            cursor: pointer;

            &:hover {
                background-color: var(--dark-color-accent);
            }
        }
    }
}
</style>
