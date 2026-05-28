import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { PiniaColada } from "@pinia/colada";
import { useAuthStore } from "./store/authStore";
import { PiniaColadaDelay } from "@pinia/colada-plugin-delay";

import "@imengyu/vue3-context-menu/lib/vue3-context-menu.css";

export const AUDIO_FILE_STORE_KEY = ["audio"];
export const ALBUM_STORE_KEY = ["album"];
export const SONG_STORE_KEY = ["song"];
export const PLAYLIST_STORE_KEY = ["playlist"];
export const FAVOURITE_STORE_KEY = ["favourite"];
export const CURRENT_STORE_KEY = ["currently-playing"];
export const BOT_STORE_KEY = ["bot-state"];

const app = createApp(App);

const pinia = createPinia();

app.use(pinia);

const token = localStorage.getItem("__auth");
if (token) {
  const authStore = useAuthStore();
  authStore.setAuthToken(token);
}

app.use(PiniaColada, {
  queryOptions: {
    // change the stale time for all queries to 0ms
    staleTime: 1000,
  },
  mutationOptions: {
    // add global mutation options here
  },
  plugins: [
    PiniaColadaDelay({ delay: 100 }),
    // add Pinia Colada plugins here
  ],
});
app.use(router);

app.mount("#app");
