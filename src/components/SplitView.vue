<script setup lang="ts">
import Available from "./AvailablePane.vue";
import UpNext from "./UpNext.vue";
</script>

<template>
    <div class="split">
        <Available/>
        <UpNext />
    </div>
</template>

<style scoped>
.split {
  display: flex;
  width: 100%;
  flex: 1;
  min-height: 0;

  > * {
    width: 50%;
    border: 1px solid var(--dark-color-border-weak);
    padding: 15px;
    min-height: 0;
  }
}

</style>
