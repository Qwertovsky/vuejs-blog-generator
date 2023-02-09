import { routes } from './router';
import App from './App.vue';
import OutLink from './components/OutLink.vue';
import LinkToPost from './components/LinkToPost.vue';

import { posts, routes as allRoutes } from 'virtual:posts';
import type PostClass from "@/model/Post";
import { type RouteRecordRaw } from 'vue-router';

import { ViteSSG } from 'vite-ssg'

export const createApp = ViteSSG(
    App,
    {
      base: import.meta.env.VITE_BLOG_BASE,
      routes
    },
    ({ app, router, routes, isClient, initialState }) => {
      // install plugins etc.
      app.component("OutLink", OutLink);
      app.component("LinkToPost", LinkToPost);

      router.beforeEach((to, from, next) => {
          if (to.params["slug"]) {
            const slug = to.params["slug"];
            const post = posts.find((p: PostClass) => p.slug == slug)
            if (!post) {
              next({name: "NotFound", replace: true});
              return;
            }
          }
          next();
        });
    },
);

export async function includedRoutes(paths: string[], routes: RouteRecordRaw[]) {
    // Sensitive key is managed by Vite - this would not be available inside
    // vite.config.js as it runs before the environment has been populated.
    
    const included = [...allRoutes, '/about', '/404'];
    console.log('routes', included);
    return included;
  }



