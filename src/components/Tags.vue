<template>
  <ul id="default-layout" >
    <li v-for="tag in tags" :key="tag.name">
      <router-link class="page-link" :to="tag.path">{{ tag.name }}</router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { tags as allTags } from "virtual:posts";
  import type TagClass from '@/model/Tag';
  import { useHead } from '@vueuse/head';

  useHead({
    title: 'Tags | ' + import.meta.env.VITE_BLOG_NAME
  })
  
  const tags = computed<TagClass[]>(() => {
      return allTags;
    });
  

</script>