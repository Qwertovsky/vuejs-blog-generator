<template>
  <div class="post">
    <div class="post_title">
      <LinkToPost :text="title" :outbound="outbound" :url="postUrl" />
    </div>
    <div class="post_meta">
      {{postDate}}
      <MetaTags :tags="fm.tags" />
    </div>
    
    <div class="post_content">
      
      <component :is="contentComponent" :excerpt="excerpt"></component>
      
      <LinkToPost v-if="readMore"
        text="read more" :outbound="outbound" :url="postUrl" />
    </div>
    
  </div>
</template>

<script setup lang="ts">
  import type PostClass from '@/model/Post';

  import MetaTags from "@/components/MetaTags.vue";
  import LinkToPost from "@/components/LinkToPost.vue";
  
  import { h, shallowRef, computed, defineComponent, defineAsyncComponent } from "vue";
  import type { PropType } from "vue";
  import { useRoute, onBeforeRouteUpdate } from 'vue-router';
  import { useHead } from '@vueuse/head';
  import { posts } from 'virtual:posts';
  

  const props = defineProps( {
    postData: {
      type: Object as PropType<PostClass>,
      required: false
    },
    more: {
      type: Boolean,
      default: true
    }
  });

  let content = shallowRef(defineComponent({
    render: () => h('div', {innerHTML: 'Rendering...'})
  }));

  const route = useRoute();
  onBeforeRouteUpdate((to, from) => {
    if (!to.params.slug) {
      return true;
    }
    post = findPostBySlug(<string>to.params.slug);
    loadPostContent();
    return true;
  });

  let post: PostClass;
    
  if (!props.postData) {
    const slug = <string>route.params["slug"];
    post = findPostBySlug(slug);
  } else {
    post = props.postData;
  }

  useHead(computed(() => {
      if (!route.params.slug) {
        // skip for index pages
        return {};
      }
      return {
        title: post.title + " | " + import.meta.env.VITE_BLOG_NAME
      };
    })
  );

  

  function findPostBySlug(slug: string): PostClass {
    return posts.find((p:  PostClass) => p.slug == slug) || <PostClass>{};
  }
  
  function loadPostContent() {
    content.value = defineAsyncComponent(post.component);
  }
  
  
  const title = computed(() => {
      return fm.value && fm.value.title;
    });

  const postDate = computed<string>(() => {
    const d: string = fm.value.date;
    return d.substring(0, 10);
  });

  const fm = computed(() => {
      return post;
    });

  const contentComponent = computed(() => {
    return content.value;
    
  });

  const postUrl = computed<string | undefined>(() => {
    if (!fm.value) {
      return undefined;
    }
    let postUrl: string | undefined = "/posts/" + fm.value.slug;
    const slug = route.params["slug"];
    if (slug) {
      postUrl = undefined;
    } else if (fm.value.url) {
      postUrl = fm.value.url;
    }
    return postUrl;
  });

  const outbound = computed(() => {
      return fm.value && fm.value.url != null;
    });

  const readMore = computed(() => {
    if (props.more) {
      // show full post
      return false;
    }
    return outbound.value || post.more;
  });

  const excerpt = computed(() => {
    if (props.more) {
      // show full post
      return false;
    }
    return post.more;
  });
  
  loadPostContent();

</script>