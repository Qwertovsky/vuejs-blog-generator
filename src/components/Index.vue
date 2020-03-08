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

<script>
const allPosts = JSON.parse(process.env.VUE_APP_POSTS);
import Post from "@/components/Post.vue";

const POSTS_PER_PAGE = process.env.VUE_APP_POSTS_PER_PAGE;

export default {
  computed: {
    hasPrev() {
      return !(this.maxIndex == 1 || this.index == 1)
    },
    hasNext() {
      return !!this.index && this.index != this.maxIndex;
    },
    prevUrl() {
      let url = null;
      
      if (this.maxIndex == 1 || this.index == 1) {
        return null;
      }
      if (this.tag) {
        url = `/tag/${this.tag}/page/${this.index - 1}`;
      } else {
        url = `/page/${this.index - 1}`;
      }
      return url;
    },
    nextUrl() {
      let url = null;
      if (this.index == this.maxIndex) {
        return null;
      }
      if (this.index == this.maxIndex - 1) {
        if (this.tag) {
          url = `/tag/${this.tag}`;
        } else {
          url = `/`;
        } 
      } else {
        if (this.tag) {
          url = `/tag/${this.tag}/page/${this.index + 1}`;
        } else {
          url = `/page/${this.index + 1}`;
        }
      }
      return url;
    },
    postsByTag() {
      let posts = allPosts
      .filter(post => 
        (this.tag == null
          || post.tags
            && post.tags.some(t => t.toLowerCase() == this.tag))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
      return posts;
    },
    tag() {
      return this.$route.params["tag"];
    },
    index() {
      let index = Number(this.$route.params["index"]);
      if (!index) {
        index = this.maxIndex;
      }
      return index;
    },
    maxIndex() {
      return Math.ceil(this.postsByTag.length / POSTS_PER_PAGE);
    }, 
    posts() {
      let posts = this.postsByTag;
      let index = this.index;
      if (!index) {
        index = this.maxIndex;
      }
      posts = posts.slice(Math.max(0, posts.length - index * POSTS_PER_PAGE),
        posts.length - (index - 1) * POSTS_PER_PAGE);
      return posts;
    }
  },
  components: {
    Post
  }
}
</script>
