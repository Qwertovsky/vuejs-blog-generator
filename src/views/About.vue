<template>
  <div class="about">
    <h1>This is {{blogName}}</h1>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed } from 'vue';

const blogName = import.meta.env.VITE_BLOG_NAME;

useHead(computed(() => {
    return {
      title: blogName
    };
  })
);

</script>
