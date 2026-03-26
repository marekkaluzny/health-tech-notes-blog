const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

function countWords(content) {
  return content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });

  eleventyConfig.addFilter("readTime", function (content) {
    const words = countWords(content || "");
    return Math.max(1, Math.ceil(words / 200));
  });

  eleventyConfig.addFilter("dateFormat", function (date) {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  });

  eleventyConfig.addShortcode("asset_img", function (filename, alt = "") {
    const safeAlt = String(alt).replace(/"/g, "&quot;");
    return `<img src="/assets/img/posts/${filename}" alt="${safeAlt}" loading="lazy">`;
  });

  eleventyConfig.addCollection("tagList", function (collectionApi) {
    const tags = new Set();

    for (const item of collectionApi.getFilteredByTag("posts")) {
      for (const tag of item.data.tags || []) {
        if (tag !== "posts" && tag !== "all") {
          tags.add(tag);
        }
      }
    }

    return Array.from(tags).sort((left, right) => left.localeCompare(right));
  });

  eleventyConfig.setLibrary(
    "md",
    markdownIt({
      html: true,
      linkify: true,
      typographer: true,
    }).use(markdownItAnchor)
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
    frontMatterParsingOptions: {
      excerpt: true,
      excerpt_separator: "<!-- excerpt -->",
      excerpt_alias: "post_excerpt",
    },
    templateFormats: ["md", "html", "liquid"],
  };
};