import { ViteSSG } from 'vite-ssg';
import type { HeadClient } from '@vueuse/head';
import App from './App.vue';
import { routes } from './router';
import OutLink from './components/OutLink.vue';
import LinkToPost from './components/LinkToPost.vue';

import { posts, routes as allRoutes } from 'virtual:posts';
import type PostClass from "@/model/Post";
import type { RouteRecordRaw } from 'vue-router';

export const createApp = ViteSSG(
    App,
    {
        routes,
        base: `/blog/`
    },
    ({ app, router, isClient, head }) => {
        if (head) {
            const updateDom = head.updateDOM;
            head.updateDOM = (document = window.document) => {
                document.head.querySelectorAll("script").forEach((s) => s.remove());
                document.head.querySelectorAll('link[rel="modulepreload"]').forEach((e) => e.remove());
                updateDom(document);
            };
        }

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
        if (isClient) {
            
        }
    },
    {
        useHead: true
    }
);

export async function includedRoutes(paths: string[], routes: RouteRecordRaw[]) {
    // Sensitive key is managed by Vite - this would not be available inside
    // vite.config.js as it runs before the environment has been populated.
    
    const included = [...allRoutes, '/about', '/404'];
    console.log('routes', included);
    return included;
      
    
  }



