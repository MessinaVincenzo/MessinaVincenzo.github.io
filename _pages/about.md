---
permalink: /
scenes: true          # loads assets/js/orbital*.js for the hero scene
author_profile: false   # single column: the hero already states name and affiliation
redirect_from:
  - /about/
  - /about.html
---

{% include base_path %}

<div class="hero">

  <div class="hero__scene" data-scene="hero" role="img"
       aria-label="A satellite constellation agreeing which of its spacecraft
                   serves an observation request, by passing only satellite
                   identifiers and reward scores between neighbours.">
    <canvas class="hero__canvas" aria-hidden="true"></canvas>
  </div>
  <span class="hero__scrim" aria-hidden="true"></span>

  <span class="hero__shooting"></span>
  <span class="hero__shooting hero__shooting--b"></span>

  <p class="hero__eyebrow">Technical University of Munich &middot; Chair of Spacecraft Systems</p>
  <h1 class="hero__title">Vincenzo Messina</h1>
  <p class="hero__lede">
    Space engineer, Research Associate and Doctoral Candidate working on
    decentralized coordination for distributed satellite systems &mdash; helping
    satellites decide for themselves while staying in consensus across the network.
  </p>
  <ul class="hero__chips">
    <li>Decentralized Satellite Networks</li>
    <li>Distributed Satellite Systems</li>
    <li>Satellite Constellations</li>
  </ul>
  <div class="hero__actions">
    <a class="btn btn--primary" href="{{ base_path }}/publications/">Publications</a>
    <a class="btn btn--ghost" href="{{ base_path }}/cv/">CV</a>
    <a class="btn btn--ghost" href="{{ base_path }}/portfolio/">Projects</a>
  </div>
</div>


Hi! I am Vincenzo Messina, a Research Associate and Doctoral Candidate at the
Chair of Spacecraft Systems, Technical University of Munich.

My research proposes and analyses methods for optimizing **decentralized satellite
operations** in distributed satellite systems &mdash; letting satellites decide for
themselves while holding consensus across the network, through the strategic
exchange of observational tasks.

{% assign pubs = site.publications | sort: "date" | reverse %}

<ul class="metrics">
  <li><span class="metrics__n">{{ pubs | size }}</span><span class="metrics__k">Publications</span></li>
  <li><span class="metrics__n">{{ site.talks | size }}</span><span class="metrics__k">Talks</span></li>
  <li><span class="metrics__n">{{ site.data.theses | size }}</span><span class="metrics__k">Theses supervised</span></li>
  <li><span class="metrics__n">{{ site.data.network.totals.coauthors }}</span><span class="metrics__k">Co&#8209;authors</span></li>
</ul>

## Research interests

<ul class="topics">
  <li>
    {% include research-glyph.html kind="mesh" %}
    <h3 class="topics__h">Decentralized satellite networks</h3>
    <p class="topics__p">
      Coordination and consensus across a federation of independently operated
      spacecraft, without a single point of dependency.
    </p>
    <a class="topics__link" href="{{ base_path }}/publications/">6 papers &rarr;</a>
  </li>
  <li>
    {% include research-glyph.html kind="central" %}
    <h3 class="topics__h">Distributed task allocation</h3>
    <p class="topics__p">
      Scheduling observations under limited on-board computation, power and
      link budget &mdash; and what central nodes are actually worth.
    </p>
    <a class="topics__link" href="{{ base_path }}/publications/">4 papers &rarr;</a>
  </li>
  <li>
    {% include research-glyph.html kind="event" %}
    <h3 class="topics__h">Space situational awareness</h3>
    <p class="topics__p">
      Detecting and tracking resident space objects collaboratively, including
      with neuromorphic event cameras on the EventSat CubeSat.
    </p>
    <a class="topics__link" href="{{ base_path }}/publications/">7 papers &rarr;</a>
  </li>
  <li>
    {% include research-glyph.html kind="walker" %}
    <h3 class="topics__h">Constellation design</h3>
    <p class="topics__p">
      Network analysis, latency optimization and mission architecture trade
      studies &mdash; from Earth observation to lunar navigation.
    </p>
    <a class="topics__link" href="{{ base_path }}/publications/">5 papers &rarr;</a>
  </li>
</ul>

## Selected publications

<ul class="selected">
{% assign featured = pubs | where: "featured", true %}
{% for post in featured limit: 5 %}
  <li>
    <a class="selected__title" href="{{ base_path }}{{ post.url }}">{{ post.title }}</a>
    <span class="selected__meta">
      {{ post.authors | replace: "**", "" }} &middot; {{ post.venue_short }}, {{ post.date | date: "%Y" }}
    </span>
  </li>
{% endfor %}
</ul>

<p><a href="{{ base_path }}/publications/">All {{ pubs | size }} publications &rarr;</a> &nbsp;&middot;&nbsp; <a href="{{ base_path }}/research-map/">Research map &rarr;</a></p>

{% if site.posts.size > 0 %}
## Latest news

<ul class="feed feed--compact">
{% for post in site.posts limit: 5 %}
  <li class="feed__item">
    <figure class="feed__thumb">
      {% if post.header.teaser %}
        <img src="{{ base_path }}/images/{{ post.header.teaser }}" alt="{{ post.image_alt | default: post.title | escape }}" loading="lazy"{% if post.image_focus %} style="object-position: {{ post.image_focus }}"{% endif %}>
      {% else %}
        <span class="feed__ph">{% include news-icon.html kind=post.kind %}</span>
      {% endif %}
    </figure>
    <div class="feed__body">
      <p class="feed__top">
        <span class="feed__date">{{ post.date | date: "%d %b %Y" }}</span>
        <span class="feed__tag feed__tag--{{ post.kind | default: 'research' }}">{{ post.kind | default: 'news' }}</span>
      </p>
      <h3 class="feed__title"><a href="{{ base_path }}{{ post.url }}">{{ post.title }}</a></h3>
      {% if post.summary %}<p class="feed__excerpt">{{ post.summary }}</p>{% endif %}
      {% if post.location %}
        <p class="feed__where">
          <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><path d="M8 0a5 5 0 0 0-5 5c0 4 5 11 5 11s5-7 5-11a5 5 0 0 0-5-5Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg>
          {{ post.location }}
        </p>
      {% endif %}
    </div>
  </li>
{% endfor %}
</ul>

<p><a href="{{ base_path }}/year-archive/">All news &rarr;</a></p>
{% endif %}
