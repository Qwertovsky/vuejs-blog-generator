<template>
  <span>
    <span v-for="t of tags" :key="t">
      | <router-link :to="tagUrl(t)">{{t}}</router-link>
    </span>
  </span>
</template>

<script setup lang="ts">
  import type { PropType } from "vue";

  const props = defineProps({
    tags: Object as PropType<string[]>
  });
  
  function tagUrl(tag: string) {
    return "/tag/" + tag.toLowerCase();
  }
  

</script>