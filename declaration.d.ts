

declare module 'virtual:posts' {
    import PostClass from "./src/model/Post";
    import TagClass from "./src/model/Tag";
    
    export const posts: PostClass;
    export const tags: TagClass;
}