---
layout: default
pagination:
  data: collections.tagList
  size: 1
  alias: tag
permalink: /tags/{{ tag }}/
eleventyComputed:
  title: "{{ tag }}"
---  

<div class="md:border-l md:border-slate-200 md:pl-6 md:dark:border-slate-700/60">
  <div class="flex max-w-2xl flex-col space-y-16">
    {% for post in collections[tag] %}
      <article class="md:grid md:grid-cols-4 md:items-baseline">
        <div class="group relative flex flex-col items-start md:col-span-3">
          <h2 class="text-base font-semibold tracking-tight text-slate-800 dark:text-slate-100">
            <div class="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-slate-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:-inset-x-6 sm:rounded-2xl dark:bg-slate-800/50"></div>
            <a href="{{ post.url }}">
              <span class="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl"></span>
              <span class="relative z-10">{{ post.data.title }}</span>
            </a>
          </h2>
          <time class="relative z-10 order-first mb-3 flex items-center text-sm text-slate-400 md:hidden dark:text-slate-500" datetime="{{ post.date | date: '%Y-%m-%d' }}">
            <span class="absolute inset-y-0 left-0 flex items-center" aria-hidden="true"><span class="h-4 w-0.5 rounded-full bg-slate-200 dark:bg-slate-500"></span></span>
            <span class="pl-3.5">{{ post.date | date: "%d-%m-%Y" }}</span>
          </time>
          <p class="relative z-10 mt-2 text-sm text-slate-600 dark:text-slate-400">{{ post.data.post_excerpt }}...</p>
          <div aria-hidden="true" class="relative z-10 mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
            Read article
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="ml-1 h-4 w-4 stroke-current"><path d="M6.75 5.75 9.25 8l-2.5 2.25" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </div>
        </div>
        <time class="relative z-10 order-first mt-1 mb-3 hidden items-center text-sm text-slate-400 md:block dark:text-slate-500" datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: "%d-%m-%Y" }}</time>
      </article>
    {% endfor %}
  </div>
</div>
