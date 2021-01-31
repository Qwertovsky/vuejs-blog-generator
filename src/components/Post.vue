<template>
  <div class="post">
    <div class="post_title">
      <LinkToPost :text="title" :outbound="outbound" :url="postUrl" />
    </div>
    <div class="post_meta">
      {{fm.date}}
      <MetaTags :tags="fm.tags" />
    </div>
    <div class="post_content">
      <component :is="contentComponent"></component>
      <LinkToPost v-if="readMore"
        text="read more" :outbound="outbound" :url="postUrl" />
    </div>
    
  </div>
</template>

<script>
const posts = JSON.parse(process.env.VUE_APP_POSTS);
import MetaTags from "@/components/MetaTags.vue";
import LinkToPost from "@/components/LinkToPost.vue";
import { h } from 'vue';

export default {
  components: {
    MetaTags,
    LinkToPost
  },
  props: {
    postData: Object,
    more: {
      type: Boolean,
      default: true
    }
  },
  data() {
    let post = this.postData;
    if (!post) {
      const slug = this.$route.params["slug"];
      post = posts.find((p) => p.slug == slug);
    }
    let contentPromise;
    if (this.more) {
      contentPromise = import("@PostsDir/" + post.slug + "?more=true");
    } else {
      contentPromise = import("@PostsDir/" + post.slug);
    }
    contentPromise.then(({default: html}) => { this.content = html; });
    return {
      post,
      content: null,
      excerpt: null
    }
  },
  computed: {
    title() {
      return this.fm && this.fm.title;
    },
    fm() {
      return this.post;
    },
    contentComponent() {
      if (this.content) {
        return {
          template: this.content
        };
      } else {
        return {
          render() {
            return h("div", "Rendering..");
          }
        };
      }
    },
    postUrl() {
      let postUrl = "/posts/" + this.fm.slug;
      const slug = this.$route.params["slug"];
      if (slug) {
        postUrl = null;
      } else if (this.fm.url) {
        postUrl = this.fm.url;
      }
      return postUrl;
    },
    outbound() {
      return this.fm.url;
    },
    readMore() {
      return this.outbound || (this.post.more && !this.more);
    }
  }
}
</script>