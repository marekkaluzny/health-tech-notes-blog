const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const rawPathPrefix =
  process.env.ELEVENTY_PATH_PREFIX ||
  (process.env.GITHUB_ACTIONS === "true" && repoName ? `/${repoName}/` : "/");
const normalizedPathPrefix =
  rawPathPrefix === "/" ? "" : `/${rawPathPrefix.replace(/^\/+|\/+$/g, "")}`;

function withBase(value) {
  const input = String(value || "");

  if (!input) {
    return input;
  }

  if (
    /^(?:[a-z]+:)?\/\//i.test(input) ||
    input.startsWith("mailto:") ||
    input.startsWith("tel:") ||
    input.startsWith("#")
  ) {
    return input;
  }

  const match = input.match(/^([^?#]*)(.*)$/);
  const pathname = match ? match[1] : input;
  const suffix = match ? match[2] : "";
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (!normalizedPathPrefix) {
    return `${normalizedPathname}${suffix}`;
  }

  if (
    normalizedPathname === normalizedPathPrefix ||
    normalizedPathname.startsWith(`${normalizedPathPrefix}/`)
  ) {
    return `${normalizedPathname}${suffix}`;
  }

  return `${normalizedPathPrefix}${normalizedPathname}${suffix}`;
}

function slugifyTag(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = function (eleventyConfig) {
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "<!-- excerpt -->",
    excerpt_alias: "post_excerpt",
  });

  eleventyConfig.addLiquidFilter("withBase", withBase);
  eleventyConfig.addLiquidFilter("slugifyTag", slugifyTag);

  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const ignoredTags = new Set(["all", "nav", "post", "posts"]);
    const tagNames = new Set();

    for (const item of collectionApi.getAllSorted()) {
      const tags = item.data.tags;

      if (!tags) {
        continue;
      }

      for (const tag of Array.isArray(tags) ? tags : [tags]) {
        if (!tag || ignoredTags.has(tag)) {
          continue;
        }

        tagNames.add(tag);
      }
    }

    return Array.from(tagNames)
      .sort((left, right) => left.localeCompare(right))
      .map((name) => ({
        name,
        slug: slugifyTag(name),
      }));
  });

  eleventyConfig.addLiquidFilter("readTime", (content) => {
    const text = String(content || "")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z0-9#]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    const wordCount = text ? text.split(" ").length : 0;
    return Math.max(1, Math.ceil(wordCount / 200));
  });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });

  return {
    pathPrefix: rawPathPrefix,
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};