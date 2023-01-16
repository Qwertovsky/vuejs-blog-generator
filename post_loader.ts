
import grayMatter from "gray-matter";
import markdownIt from "markdown-it";
import prism from "prismjs";
import escapeHtml from "escape-html";

import prismLoadLanguages from "prismjs/components/";

import { useExcerpt } from './utils';


const DEFAULT_LANG = "text";

prismLoadLanguages([
  "html",
  "css",
  "scss",
  "md",
  "js",
  "ts",
  "java",
  "bash",
  "rust",
  "json",
  "properties",
  "sql"
]);

function getLangCodeFromExtension (extension: string) {
  const extensionMap = {
    vue: "html",
    rs: "rust"
  }
  return extensionMap[extension] || extension;
}

function highlight(str: string, lang = DEFAULT_LANG) {
  let code;
  lang = getLangCodeFromExtension(lang);
  if (prism.languages[lang]) {
    code = prism.highlight(str, prism.languages[lang], lang);
  } else {
    code = escapeHtml(str);
  }
  return code;
}

function oneRootElement(html: string) {
  return `<div>${html}</div>`;
}

function parseRequest(id: string): {
  filename: string
  query: URLSearchParams
} {
  const [filename, rawQuery] = id.split(`?`, 2)
  const query: URLSearchParams = new URLSearchParams(rawQuery);
  return {
    filename,
    query
  }
}

const markdown = markdownIt({
  html: true,
  highlight: highlight
});
markdown.use((md) => {
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx, options, , self] = args;
    const token = tokens[idx];

    let lang = DEFAULT_LANG;
    let fileName;
    const infos = token.info.trim().split(" ");
    if (infos.length > 0) {
      lang = infos[0];
      const fileNameInfo = infos.find((i) => i.startsWith("file_name"));
      if (fileNameInfo) {
        fileName = fileNameInfo.replace(/^file_name="(.*)"$/g, "$1");
      }
    }

    const code = highlight(token.content, lang);
    let className = `language-${lang}`;
    if (fileName) {
      className += ` has_file_name`;
    }
    let result = `<pre v-pre class="${className}">`;
    if (fileName) {
      result += `<span class="file_name">${fileName}</span>`;
    }
    result += `<code class="language-${lang}">${code}</code></pre>`;
    return result;
  }
});

function toHtml(document: string | undefined): string | undefined {
  if (document) {
    document = markdown.render(document);
    document = document
    .replace(/\bimport\.meta/g, 'import.<wbr/>meta')
    .replace(/\bprocess\.env/g, 'process.<wbr/>env');
    document = oneRootElement(document);
    return document;
  }
}

export default function postLoader() {
  
  return {
      name: 'vite:post-loader',

      resolveId(id: string, importer: string) {
        if (id.indexOf('/posts/') >= 0 && (id.indexOf('.md') >= 0 )) {
          console.log("resolved", id, importer);
          return id;
        }
        return null;
      },

      load(resolvedId: string) {
        if (resolvedId.indexOf('/posts/') < 0) {
          return null;
        }
        
        if (resolvedId.indexOf('.md') < 0) {
          return null;
        }

        let { filename } = parseRequest(resolvedId);

        const fmData = grayMatter.read(filename, { excerpt: useExcerpt});

        // skip drafts - rollup-dynamic-import loads all files from ./posts
        if (fmData.data.draft == true) {
          return {
            code: `{}`
          }
        }
        
        let content = fmData.content;
        let excerpt;
        if (fmData.excerpt) {
          excerpt = fmData.excerpt;
        } else if (fmData.data.description) {
          excerpt = fmData.data.description;
        }
        
        excerpt = toHtml(excerpt);
        content = toHtml(content)!;
        
        return {
          code: JSON.stringify({excerpt, content}),
          map: null
        };
      },

      transform(source: any, resolvedId: string, options: any) {
        if (resolvedId.indexOf('/posts/') < 0) {
          return null;
        }
        if (resolvedId.indexOf('.md') < 0) {
          return null;
        }

        source = JSON.parse(source);

        return {
          code: `
          <template>
            <div>
              <div v-if="excerpt">${source.excerpt}</div>
              <div v-else>${source.content}</div>
            </div>
          </template>
          
          <script setup>
            import { defineProps } from "vue";

            let props = defineProps({
              excerpt: {
                type: Boolean,
                default: false
              }
            });
          </script>
          `,
          map: null
        };
      }
  }
}