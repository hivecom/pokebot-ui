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
      component: () => SongsView,
    },
    {
      path: "/playlists",
      name: "playlists",
      component: () => import("../views/PlaylistsView.vue"),
    },
    {
      path: "/favourites",
      name: "favourites",
      component: () => import("../views/FavouritesView.vue"),
    },
    {
      path: "/untagged",
      name: "untagged",
      component: () => import("../views/UntaggedView.vue"),
    },
  ],
});

export default router;
