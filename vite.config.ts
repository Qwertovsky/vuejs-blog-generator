import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import postLoader from './post_loader.ts';
import postsVirtual from './posts_loader';
import type PostClass from './src/model/Post';
import type { ViteSSGOptions } from 'vite-ssg';

declare module '@virtual:posts' {
    export const posts: PostClass;
}

declare module 'vite' {
  interface UserConfig {
    ssgOptions?: ViteSSGOptions | undefined;
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/blog/',
  build: {
    outDir: 'dist/blog'
  },
  plugins: [
    postLoader(),
    vue({
      include: [/\.vue$/, /\.md$/]
    }),
    postsVirtual()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  
  ssgOptions: {
    formatting: 'prettify',
    rootContainerId: 'app',
    concurrency: 1
  }
})
