---
layout: archive
title: "Sitemap"
permalink: /sitemap/
author_profile: true
---

{% include base_path %}

A list of all the posts and pages found on the site. For you robots out there, there is an [XML version]({{ base_path }}/sitemap.xml) available for digesting as well.

{% comment %}
  site.pages is not only the human-facing pages: it also holds generated assets
  (main.css, feed.xml, sitemap.xml, robots.txt) and the redirect stubs that
  jekyll-redirect-from emits for old URLs. None of those carry a title, so they
  rendered as a column of empty cards.

  Each title is normalised through default and strip before being compared to
  an empty string. Testing the title for truthiness does not work, because
  Liquid treats an empty string as true.

  Pages carrying "sitemap: false" are skipped too. That is jekyll-sitemap's own
  flag, so one setting keeps a page out of both this list and sitemap.xml. It
  marks the theme's scaffolding pages (Markdown, Page not in menu, the category
  and tag archives, Talk map), which still work but are not part of the site
  anyone is meant to browse.

  Do not write Liquid tag delimiters inside a comment block - Liquid still
  parses tags in here, and an if written out in full breaks the build.
{% endcomment %}

<h2>Pages</h2>
{% for post in site.pages %}
  {% assign entry_title = post.title | default: "" | strip %}
  {% if entry_title != "" and post.sitemap != false %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %}

<h2>Posts</h2>
{% for post in site.posts %}
  {% assign entry_title = post.title | default: "" | strip %}
  {% if entry_title != "" and post.sitemap != false %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %}

{% comment %}
  The heading is only emitted when the collection actually holds documents -
  otherwise an empty collection, such as talks, left a bare heading behind.
{% endcomment %}

{% comment %}
  Keep the HTML below flush against the left margin. This file is Markdown, so
  a line indented by four spaces or more is parsed as a code block - an
  indented heading renders as literal text in a grey box instead of a heading.
{% endcomment %}

{% for collection in site.collections %}
{% unless collection.output == false or collection.label == "posts" %}
{% if collection.docs.size > 0 %}
<h2>{{ collection.label | capitalize }}</h2>
{% for post in collection.docs %}
  {% assign entry_title = post.title | default: "" | strip %}
  {% if entry_title != "" and post.sitemap != false %}
  {% include archive-single.html %}
  {% endif %}
{% endfor %}
{% endif %}
{% endunless %}
{% endfor %}
