<script setup lang="ts">
import UploadButton from "./UploadButton.vue";
</script>


<template>
    <div class="available">
        <header>
            <nav>
                <RouterLink to="/">Songs</RouterLink>
                <RouterLink to="/playlists">Playlists</RouterLink>
                <RouterLink to="/favourites">Favourites</RouterLink>
            </nav>
            <UploadButton />
        </header>

        <RouterView />
    </div>
</template>

<style scoped>
.available {
    display: flex;
    flex-direction: column;
}
header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  nav {
    display: flex;
    list-style-type: none;
    gap: 15px;
    font-size: 32px;

    a {
      color: white;
      text-decoration: none;

      &.router-link-active {
        color: var(--dark-color-accent);
        text-decoration: underline;
      }
    }
  }
}
</style>
