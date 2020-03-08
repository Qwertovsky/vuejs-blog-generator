# Vue.js Blog Generator
Static blog generator. Vue CLI template.

# Use

Place markdown files to `./posts` directory.

File should be like this:
```markdown
---
{
  "title": "Posts title",
  "date": "2020-01-31",
  "tags": ["vue.js", "blog"],
  "description": null
}
---

Excerpt

<!-- more -->

Other content
```

You can use `<!-- more -->` to split a excerpt from post content. Otherwise `description` should be added to frontmatter.

To start development:
```
npm run serve
```
To build static files:
```
npm run build
```
To build last posts with date >= `2020-01-31`:
```
npm run build -- --post-date=2020-01-31
```

Read [blog post](https://qwertovsky.com/blog/posts/00023_creating_blog_with_vue.js.md) to understand how it works.
