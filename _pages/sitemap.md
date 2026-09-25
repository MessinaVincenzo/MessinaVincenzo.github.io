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

  Do not write Liquid tag delimiters inside a comment block - Liquid still
  parses tags in here, and an if written out in full breaks the build.
{% endcomment %}

<h2>Pages</h2>
{% for post in site.pages %}
  {% assign entry_title = post.title | default: "" | strip %}
  {% if entry_title != "" %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %}

<h2>Posts</h2>
{% for post in site.posts %}
  {% assign entry_title = post.title | default: "" | strip %}
  {% if entry_title != "" %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %}

{% capture written_label %}'None'{% endcapture %}

{% for collection in site.collections %}
{% unless collection.output == false or collection.label == "posts" %}
  {% capture label %}{{ collection.label }}{% endcapture %}
  {% if label != written_label %}
  <h2>{{ label }}</h2>
  {% capture written_label %}{{ label }}{% endcapture %}
  {% endif %}
{% endunless %}
{% for post in collection.docs %}
  {% assign entry_title = post.title | default: "" | strip %}
  {% unless collection.output == false or collection.label == "posts" or entry_title == "" %}
  {% include archive-single.html %}
  {% endunless %}
{% endfor %}
{% endfor %}
