const grayMatter = require("gray-matter");
const markdownIt = require("markdown-it");
const escapeHtml = require("escape-html");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const prism = require("prismjs");
const prismLoadLanguages = require("prismjs/components/");

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

function getLangCodeFromExtension (extension) {
  const extensionMap = {
    vue: "html",
    rs: "rust"
  }
  return extensionMap[extension] || extension;
}

function highlight(str, lang = DEFAULT_LANG) {
  let code;
  lang = getLangCodeFromExtension(lang);
  if (prism.languages[lang]) {
    code = prism.highlight(str, prism.languages[lang], lang);
  } else {
    code = escapeHtml(str);
  }
  return code;
}

function highlightHtml(html) {
  const document = new JSDOM(html).window.document;
  prism.highlightAllUnder(document, false);
  return document.body.innerHTML;
}

function oneRootElement(html) {
  return `<div>${html}</div>`;
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

module.exports = function(source) {
  const loaderContext = this;
  const {
    resourcePath,
    resourceQuery
  } = loaderContext;

  const fmData = grayMatter(source, { excerpt_separator: "<!-- more -->"});

  const fileName = resourcePath.substring(resourcePath.lastIndexOf("/") + 1);

  let content;
  const more = /more=true/.test(resourceQuery)
  if (more) {
    content = fmData.content;
  } else {
    content = fmData.excerpt;
    if (!content && !fmData.data.description) {
      content = fmData.content;
    }
  }
  
  if (content) { // maybe null if no excerpt and description is defined
    if (fileName.endsWith(".md")) {
      content = markdown.render(content);
    } else if (fileName.endsWith(".html")) {
      content = highlightHtml(content);
    }
  } else { // excerpt not defined - use description
    content = fmData.data.description;
    // description is plain text - no processing
  }
  content = oneRootElement(content);
  return content;

  
};