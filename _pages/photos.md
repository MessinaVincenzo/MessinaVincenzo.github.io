---
layout: archive
title: "Photos"
permalink: /photos/
author_profile: true
---

{% include base_path %}

Space, opera, food and travel.

<div class="gallery-grid">
{% for photo in site.data.gallery %}
  <a class="gallery-item image-popup"
     href="{{ base_path }}/images/gallery/{{ photo.image }}"
     title="{{ photo.caption | escape }}">
    <img src="{{ base_path }}/images/gallery/{{ photo.thumb }}"
         alt="{{ photo.caption | escape }}"
         loading="lazy">
    <span class="gallery-item__caption">{{ photo.caption }}</span>
  </a>
{% endfor %}
</div>
