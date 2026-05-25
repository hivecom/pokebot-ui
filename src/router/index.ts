import { createRouter, createWebHistory } from "vue-router";
import SongsView from "../views/SongsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: SongsView,
    },
    {
      path: "/songs",
      name: "songs",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/SongsView.vue"),
    },
    {
      path: "/playlists",
      name: "playlists",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/PlaylistsView.vue"),
    },
    {
      path: "/favourites",
      name: "favourites",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/FavouritesView.vue"),
    },
  ],
});

export default router;
