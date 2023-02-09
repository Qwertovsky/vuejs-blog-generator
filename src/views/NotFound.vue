<template>
  <div class="post">
    <div class="post_title">
      404 Page not found
    </div>
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
