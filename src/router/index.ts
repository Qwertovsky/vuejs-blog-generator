import { createRouter, createWebHistory } from "vue-router";

import Index from '@/components/Index.vue'
import Tags from '@/components/Tags.vue'
import Post from '@/components/Post.vue'

import About from "@/views/About.vue";
import NotFound from "@/views/NotFound.vue";

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
    component: NotFound
  },
  {
    path: "/:pathMatch(.*)*",
    name: "All",
    component: NotFound
  }
];

export { routes };


