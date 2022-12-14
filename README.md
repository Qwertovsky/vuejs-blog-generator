# Vue.js Blog Generator
Static blog generator. Vue 3 template.

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

Settings are in .env file.

To build last posts with date >= `2022-01-31`:
```
VITE_POST_DATE=2022-01-31
```

