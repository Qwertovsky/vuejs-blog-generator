<template>
  <div id="posts">
    <div class="post_wrap"
    v-for="post in posts" :key="post.slug">
      <Post :post-data="post" :more="false"
       />
    </div>
    <div class="pagination">
      <div class="pagination_older">
        <router-link v-if="hasPrev" :to="prevUrl" title="Old">« Old</router-link>
      </div>
      <div class="pagination_home">
      </div>
      <div class="pagination_newer">
        <router-link v-if="hasNext" :to="nextUrl" title="New">New »</router-link>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
  import Post from "@/components/Post.vue";
  import { computed } from 'vue';
  import { useRoute, onBeforeRouteUpdate } from 'vue-router';
  import type PostClass from "@/model/Post";
  import { posts as allPosts } from 'virtual:posts';
  import { useHead } from '@vueuse/head';

  const POSTS_PER_PAGE: number = import.meta.env.VITE_POSTS_PER_PAGE;
  
  const route = useRoute();

  useHead({
    title: computed(() => {
      let title = import.meta.env.VITE_BLOG_NAME;
      const index = Number(route.params["index"]);
      const tag = route.params["tag"];
      if (index) {
        title = `Page ${index} | ${title}`;
      }
      if (tag) {
        title = `Tag ${tag} | ${title}`;
      }
      return title;
    })
  });

  onBeforeRouteUpdate((to, from) => {
    return true;
  });
  
    const hasPrev = computed(() => {
      return !(maxIndex.value == 1 || index.value == 1)
    });

    const hasNext = computed(() => {
      return !!index.value && index.value != maxIndex.value;
    });

    const prevUrl = computed(() => {
      let url = '';
      
      if (!hasPrev) {
        return '';
      }
      if (tag.value) {
        url = `/tag/${tag.value}/page/${index.value - 1}`;
      } else {
        url = `/page/${index.value - 1}`;
      }
      return url;
    });

    const nextUrl = computed(() => {
      let url = '';
      if (!hasNext) {
        return '';
      }
      if (index.value == maxIndex.value - 1) {
        if (tag.value) {
          url = `/tag/${tag.value}`;
        } else {
          url = `/`;
        } 
      } else {
        if (tag.value) {
          url = `/tag/${tag.value}/page/${index.value + 1}`;
        } else {
          url = `/page/${index.value + 1}`;
        }
      }
      return url;
    });

    const postsByTag = computed(() => {
      let posts = allPosts
      .filter((post: PostClass) => 
        (tag.value == null
          || post!.tags
            && post!.tags.some((t: string) => t.toLowerCase() == tag.value))
      )
      .sort((a: PostClass, b: PostClass) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      });
      return posts;
    });

    const tag = computed(() => {
      return route.params["tag"];
    });

    const index = computed<number>(() => {
      let index = Number(route.params["index"]);
      if (!index) {
        index = maxIndex.value;
      }
      return index;
    });

    const maxIndex = computed(() => {
      return Math.ceil(postsByTag.value.length / POSTS_PER_PAGE);
    });

    const posts = computed(() => {
      let posts = postsByTag.value;
      let indexCur = index.value;
      if (!indexCur) {
        indexCur = maxIndex.value;
      }
      posts = posts.slice(
        Math.max(0, posts.length - indexCur * POSTS_PER_PAGE),
        posts.length - (indexCur - 1) * POSTS_PER_PAGE
        );
      return posts;
    });
  
  

</script>
