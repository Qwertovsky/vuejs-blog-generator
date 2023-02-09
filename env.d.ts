/// <reference types="vite/client" />
export interface ImportMetaEnv {
  readonly VITE_BLOG_NAME: string;
  readonly VITE_BLOG_BASE: string;
  readonly VITE_POSTS_PER_PAGE: number;
  readonly VITE_POSTS_DIR: string;
  readonly VITE_POST_NUMBER: string;
  readonly VITE_POST_DATE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


declare module 'virtual:posts' {
    import PostClass from "./src/model/Post";
    import TagClass from "./src/model/Tag";

    export const posts: PostClass[];
    export const tags: TagClass[];
    export const routes: string[];
}
