const path = require("path");
const PrerenderSPAPlugin = require("prerender-spa-plugin");
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;
const fs = require("fs");
const grayMatter = require("gray-matter");

const POSTS_DIR = process.env.VUE_APP_POSTS_DIR;
const POSTS_PER_PAGE = process.env.VUE_APP_POSTS_PER_PAGE;
const BLOG_BASE = process.env.VUE_APP_BASE;

const DIST_DIR = "dist";

const PRERENDER_SERVER = {
  port: 3000,
  proxy: {}
};
if (BLOG_BASE != "/") {
  PRERENDER_SERVER.proxy[BLOG_BASE] = {
    target: `http://localhost:${PRERENDER_SERVER.port}`,
    pathRewrite: {}
  };
  PRERENDER_SERVER.proxy[BLOG_BASE].pathRewrite[`^${BLOG_BASE}`] = "/";
}

const postNumberRe = /^--post-number=([\d.]+)$/;
const postDateRe = /^--post-date=([\d-]+)$/;
let postNumberArg = process.argv.find((arg) => postNumberRe.test(arg));
let postDateArg = process.argv.find((arg) => postDateRe.test(arg));
if (postNumberArg) {
  postNumberArg = postNumberArg.replace(postNumberRe, "$1");
} else if (postDateArg) {
  postDateArg = new Date(postDateArg.replace(postDateRe, "$1"));
}

function createPagesForPosts (posts, base) {
  const pages = [];
  const maxIndex = Math.ceil(posts.length / POSTS_PER_PAGE);
  if (!postDateArg && !postNumberArg) {
    for (let i = 1; i < maxIndex; i++) {
      pages.push(base + "page/" + i);
    }
    pages.push(base);
  } else {
    posts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
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
        existsonpage = pagePosts.some((p) => new Date(p.date) >= postDateArg);
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

const allPosts = [];
const routes = [];
let tags = [];

fs.readdirSync(POSTS_DIR, {withFileTypes: true})
  .filter((file) => {
    return file.isFile() && /^.+\.(md|html)$/.test(file.name);
  })
  .forEach((file) => {
    const fileName = file.name;
    const fmData = grayMatter.read(POSTS_DIR + fileName, {excerpt_separator: "<!-- more -->"});
    if (fmData.data.draft) {
      return;
    }
    fmData.data.slug = fileName;
    fmData.data.more = !!(fmData.excerpt && fmData.excerpt.trim());
    allPosts.push(fmData.data);
    
    const slug = fileName;
    const date = new Date(fmData.data.date);
    if (!postNumberArg && !postDateArg
      || postNumberArg && slug.replace(/^0+/, '').startsWith(postNumberArg)
      || postDateArg && date >= postDateArg) {
      if (!fmData.data.url) {
        routes.push("/posts/" + slug);
      }
      if (fmData.data.tags) {
        tags.push(fmData.data.tags);
      }
    }
  });
process.env.VUE_APP_POSTS = JSON.stringify(allPosts);
routes.push(...createPagesForPosts(allPosts, "/"));

tags = tags.flat().map((tag) => tag.toLowerCase());
tags = [...new Set(tags)];
tags = tags.map((t) => {
  return {
    name: t,
    path: "/tag/" + t
  };
});
process.env.VUE_APP_TAGS = JSON.stringify(tags);

routes.push("/tag");
tags.forEach((t) => {
  const tagPosts = allPosts.filter((p) => p.tags && p.tags.indexOf(t.name) >= 0);
  routes.push(...createPagesForPosts(tagPosts, t.path + "/"));
});
console.log(routes);

module.exports = {
  runtimeCompiler: true,
  productionSourceMap: false,
  configureWebpack: config => {

    const blogConfig = {
      resolve: {
        alias: {
          "@PostsDir": path.resolve(__dirname, POSTS_DIR)
        }
      },
      optimization: {
        minimize: false
      },
      module: {
        rules: [
          {
            test: /\.(md|html)$/,
            include: path.resolve(__dirname, POSTS_DIR),
            exclude: new RegExp(POSTS_DIR + "[^\\/]+\\/"),
            use: [
              "html-loader",
              {
                loader: path.resolve(__dirname, "post_loader.js"),
              }
            ]
            
          }
        ]
      },
      plugins: [
        
      ]
    };
    if (process.env.NODE_ENV === "production") {
      const prerenderPlugin = new PrerenderSPAPlugin({
        staticDir: path.join(__dirname, DIST_DIR, BLOG_BASE),
        outputDir: path.join(__dirname, DIST_DIR),
        routes: routes.map(r => (BLOG_BASE + r).replace("//", "/")),
        server: PRERENDER_SERVER,
        renderer: new Renderer({
          injectProperty: "__PRERENDER_INJECTED",
          inject: {
            prerendered: true
          },
          navigationOptions: {
            waitUntil: "load",
            timeout: 0
          },
          maxConcurrentRoutes: 4,
        })
      });
      blogConfig.plugins = [prerenderPlugin];
    }
    return blogConfig;
  },
  chainWebpack: config => {
    
    config
      .plugin("html")
      .tap(args => {
        const options = args[0];
        options.minify = false;
        options.inject = false;
        return args;
      });
    
    const POST_IMAGES_RE = /\.(png|jpe?g|gif|webp|svg)$/;

    const noParseDefault = config.module.get("noParse");
    config.module.set("noParse", (content) => {
      let defaultResult = false;
      if (typeof noParseDefault === "function") {
        defaultResult = noParseDefault(content);
      } else {
        defaultResult = noParseDefault.test(content);
      }
      return defaultResult
        || new RegExp(POSTS_DIR + ".+\/").test(content) && !POST_IMAGES_RE.test(content);
    });

    const POSTS_DIR_RE = new RegExp(POSTS_DIR);
    config.module.rule("images").exclude.add(POSTS_DIR_RE).end();
    config.module.rule("svg").exclude.add(POSTS_DIR_RE).end();
    config.module.rule("postImages")
      .test(POST_IMAGES_RE)
      .include.add(POSTS_DIR_RE).end()
      .use("file-loader")
        .loader("file-loader")
        .options({
          name: "[path][name].[hash:8].[ext]"
        }).end();

    config.module.rule("eslint").exclude.add(POSTS_DIR_RE);
  },
  publicPath: BLOG_BASE,
  outputDir: path.join(__dirname, DIST_DIR, BLOG_BASE)
}
