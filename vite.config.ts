import { fileURLToPath, URL } from 'url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import postLoader from './post_loader.ts';
import postsVirtual from './posts_loader';
import type PostClass from './src/model/Post';
import type { ViteSSGOptions } from 'vite-ssg';
import Inspect from 'vite-plugin-inspect'

declare module '@virtual:posts' {
    export const posts: PostClass;
}

declare module 'vite' {
  interface UserConfig {
    ssgOptions?: ViteSSGOptions | undefined;
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  const envPrefix = ['VITE_'];
  const env = loadEnv(mode, process.cwd(), envPrefix);
  return {
    envPrefix,
    base: env.VITE_BLOG_BASE,
    build: {
      outDir: 'dist' + env.VITE_BLOG_BASE
    },
    plugins: [
      postLoader(),
      vue({
        include: [/\.vue$/, /\.md$/]
      }),
      postsVirtual(),
      Inspect()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // 'vue/server-renderer': '@vue/server-renderer/dist/server-renderer.esm-bundler.js',
        // 'vue': 'vue/dist/vue.esm-bundler.js',
        
      }
    },
    
    ssgOptions: {
      formatting: 'prettify',
      rootContainerId: 'app',
      concurrency: 4,
      onPageRendered(route, html, appCtx) {
        html = html.replace(/(?<=<head>[\s\S]*)(?:<script[^<]+\.js"\s*><\/script>)(?=[\s\S]*<\/head>)/g, '');
        html = html.replace(/(?<=<head>[\s\S]*)(?:<link[^>]+\.js"\s*\/?>)(?=[\s\S]*<\/head>)/g, '');
        return html;
      }
    }
  }
})
