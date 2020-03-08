import Vue from "vue";
import VueRouter from "vue-router";

import Index from "@/components/Index.vue";
import Tags from "@/components/Tags.vue";
import Post from "@/components/Post.vue";

import About from "@/views/About.vue";
import NotFound from "@/views/NotFound.vue";

const posts = JSON.parse(process.env.VUE_APP_POSTS);

Vue.use(VueRouter)

const routes = [
  {
    path: "/about",
    component: About
  },
  {
    path: "/",
    component: Index
  },
  {
    path: "/page/:index",
    component: Index
  },
  {
    path: "/tag",
    component: Tags,
    meta: {
      title: "Tags"
    }
  },
  {
    path: "/tag/:tag",
    component: Index
  },
  {
    path: "/tag/:tag/page/:index",
    component: Index
  },
  {
    path: "/posts/:slug",
    name: "post",
    component: Post,
  },
  {
    path: "/404",
    name: "NotFound",
    component: NotFound,
    alias: "*"
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});
router.beforeEach((to, from, next) => {
  let title = "Blog";
  if (to.meta.title) {
    title = to.meta.title + " | " + title;
  } else if (to.params["slug"]) {
    const slug = to.params["slug"];
    const post = posts.find((p) => p.slug == slug)
    if (!post) {
      next({name: "NotFound", replace: true});
      return;
    }
    title = post.title + " | " + title;
  } else if (to.params["index"]) {
    const index = to.params["index"];
    title = "Page " + index + " | " + title;
  }
  if (to.params["tag"]) {
    const tag = to.params["tag"];
    title = "Tag " + tag + " | " + title;
  }
  document.title = title;
  next();
});


export default router;
