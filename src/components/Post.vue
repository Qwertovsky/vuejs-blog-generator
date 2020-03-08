<template>
  <div class="post">
    <div class="post_title">
      <a v-if="outbound" :href="postUrl" target="_blank">
        {{ title }}
        <OutLink />
      </a>
      <router-link v-else-if="postUrl" :to="postUrl" target="_blank">{{ title }}</router-link>
      <span v-else>{{title}}</span>
    </div>
    <div class="post_meta">
      {{fm.date}}
      <MetaTags :tags="fm.tags" />
    </div>
    <div class="post_content">
      <component :is="contentComponent"></component>
    </div>
  </div>
</template>

<script>
const posts = JSON.parse(process.env.VUE_APP_POSTS);
import MetaTags from "@/components/MetaTags.vue";
import OutLink from "@/components/OutLink.vue";

export default {
  components: {
    MetaTags,
    OutLink
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
          render(createElement) {
            return createElement("div", "Rendering..");
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
  }
}
</script>