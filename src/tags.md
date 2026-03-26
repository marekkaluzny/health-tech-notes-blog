---
layout: default.liquid
title: Tags
---

<div class="flex flex-wrap gap-3">
  {% for tag in collections.tagList %}
    <a href="{{ '/tags/' | append: tag.slug | append: '/' | withBase }}" class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
      {{ tag.name }}
    </a>
  {% endfor %}
</div>
