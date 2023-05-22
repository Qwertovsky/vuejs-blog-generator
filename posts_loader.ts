import grayMatter from "gray-matter";
import PostClass from './src/model/Post';
import type TagClass from './src/model/Tag';
import fs from "fs";
import { useExcerpt } from './utils';

const virtualModuleId: string = 'virtual:posts';
const resolvedVirtualModuleId = '\0' + virtualModuleId
let allPosts: PostClass[] = [];
let allTags: TagClass[] = [];
let allRoutes: string[] = [];

function createPagesForPosts(posts: PostClass[], base: string, env: any) {
  const pages: string[] = [];
  const POSTS_PER_PAGE = env.VITE_POSTS_PER_PAGE;
  let postNumberArg: string = env.VITE_POST_NUMBER;
  let postDateArg: string = env.VITE_POST_DATE;

  const maxIndex = Math.ceil(posts.length / POSTS_PER_PAGE);
  if (!postDateArg && !postNumberArg) {
    for (let i = 1; i < maxIndex; i++) {
      pages.push(base + "page/" + i);
    }
    pages.push(base);
  } else {
    posts = posts.sort((a, b) => b.date.localeCompare(a.date));
    for (let i = 1; i <= maxIndex; i++) {
      const pagePosts = posts.slice(Math.max(0, posts.length - i * POSTS_PER_PAGE),
          posts.length - (i - 1) * POSTS_PER_PAGE);
      let existsonpage = false;
      if (postNumberArg) {
        existsonpage = pagePosts.some((p) => {
          return p.slug
            .replace(/^0+/, '')
            .startsWith(postNumberArg);
        });
      } else if (postDateArg) {
        existsonpage = pagePosts.some((p) => p.date >= postDateArg);
      }
      if (existsonpage) {
        if (i == maxIndex) {
          pages.push(base);
        } else {
          pages.push(base + "page/" + i);
        }
      }
    }
  }
  
  return pages;
}

export default function postsVirtual () {


  return {
    name: 'vite-posts-loader', // required, will show up in warnings and errors

    configResolved(config: any) {
      console.log(config.env);
      const POSTS_DIR = config.env.VITE_POSTS_DIR;

      let postNumberArg: string = config.env.VITE_POST_NUMBER;
      let postDateArg: string = config.env.VITE_POST_DATE;

      allPosts = [];
      allRoutes = [];
      allTags = [];

      let postTags: string[] = [];

      fs.readdirSync(POSTS_DIR, {withFileTypes: true})
        .filter((file) => {
          return file.isFile() && /^.+\.(md)$/.test(file.name);
        })
        .forEach((file) => {
          const fileName = file.name;
          const fmData = grayMatter.read(POSTS_DIR + fileName, {excerpt: useExcerpt});
          if (fmData.data.draft && !config.env.DEV) {
            return;
          }
          const post: PostClass = new PostClass();
          post.path = POSTS_DIR + fileName;
          post.slug = fileName.replace(/[\.]/g, '_');
          post.fileName = fileName.replace(/\.(md)$/g, '');
          post.extension = fileName.substring(post.fileName.length);
          post.more = !!(fmData.excerpt && fmData.excerpt.trim());
          post.date = fmData.data.date;
          post.tags = fmData.data.tags;
          post.title = fmData.data.title;
          if (fmData.data.draft) {
            post.title = '[DRAFT] '+ post.title;
          }
          post.url = fmData.data.url;
          allPosts.push(post);
          
          const slug = post.slug;
          if (!postNumberArg && !postDateArg
            || postNumberArg && slug.replace(/^0+/, '').startsWith(postNumberArg)
            || postDateArg && post.date >= postDateArg) {
            if (!post.url) {
              allRoutes.push("/posts/" + slug);
            }
            if (post.tags) {
              postTags.push(...post.tags);
            }
          }
        });
      
      
      allRoutes.push(...createPagesForPosts(allPosts, "/", config.env));

      postTags = postTags.flat().map((tag) => tag.toLowerCase());
      postTags = [...new Set(postTags)];
      allTags = postTags
      .sort()
      .map((t) => {
        return {
          name: t,
          path: "/tag/" + t
        };
      });

      allRoutes.push("/tag");
      allTags.forEach((t: TagClass) => {
        const tagPosts = allPosts.filter((p) => {
          return p.tags && p.tags.some((postTag) => postTag.toLowerCase() == t.name);
        });
        allRoutes.push(...createPagesForPosts(tagPosts, t.path + "/", config.env));
      });

      config.env.VITE_POSTS = allPosts;
      config.env.VITE_TAGS = allTags;
      config.env.VITE_ROUTES = allRoutes;

    },

    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },

    load (resolvedId: string) {
      if (resolvedId === resolvedVirtualModuleId) {
        const makeName = (slug: string) => slug.replace(/[-]/g, '_');
        const makeComponentName = (slug: string) => 'PostComponent_' + makeName(slug);
        const makePostVarName = (slug: string) => 'post_' + makeName(slug);

        let imports = '';
        for(let post of allPosts) {
          const componentName = makeComponentName(post.slug);
          imports = imports + `
            const ${componentName} = () => import('${post.path}');
          `;
        }

        let addComponentToPost = 'const allPosts = [];';
        for(let post of allPosts) {
          const postVarName = makePostVarName(post.slug);
          addComponentToPost = addComponentToPost + `
            const ${postVarName} = ${JSON.stringify(post)};
            ${postVarName}.component = ${makeComponentName(post.slug)};
            allPosts.push(${postVarName});
          `;
        }
        return {
          code: `
            ${imports}
            ${addComponentToPost}
            export const posts = allPosts;
            export const tags = ${JSON.stringify(allTags)};
            export const routes = ${JSON.stringify(allRoutes)};
            `
        };
      }
    }
  }
}