---
permalink: /
author_profile: false   # single column: the hero already states name and affiliation
redirect_from:
  - /about/
  - /about.html
---

{% include base_path %}

<div class="hero">

  <svg class="hero__scene" viewBox="0 0 620 460" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="earthFill" cx="36%" cy="22%" r="78%">
        <stop offset="0%"   stop-color="#7cc8ff"/>
        <stop offset="45%"  stop-color="#2472d4"/>
        <stop offset="100%" stop-color="#081a3f"/>
      </radialGradient>
      <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="#4da3ff" stop-opacity="0.45"/>
        <stop offset="62%"  stop-color="#4da3ff" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="#4da3ff" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Atmosphere, then the planet itself, cropped by the viewBox to a limb. -->
    <circle cx="330" cy="520" r="290" fill="url(#earthGlow)"/>
    <circle cx="330" cy="520" r="215" fill="url(#earthFill)"/>

    <!-- Orbital shells. The dashes travel, so nothing has to move. -->
    <ellipse class="hero__orbit-path"            cx="330" cy="520" rx="300" ry="150"
             transform="rotate(-14 330 520)"/>
    <ellipse class="hero__orbit-path hero__orbit-path--b" cx="330" cy="520" rx="355" ry="188"
             transform="rotate(-24 330 520)"/>
    <ellipse class="hero__orbit-path hero__orbit-path--c" cx="330" cy="520" rx="250" ry="112"
             transform="rotate(-6 330 520)"/>

    <!-- Inter-satellite links. -->
    <g class="hero__mesh">
      <polyline class="hero__link hero__d1" points="118,212 236,146 372,180"/>
      <polyline class="hero__link hero__d2" points="236,146 330,262 372,180"/>
      <polyline class="hero__link hero__d3" points="372,180 496,126 560,230"/>
      <polyline class="hero__link hero__d4" points="330,262 496,126"/>
      <polyline class="hero__link hero__d5" points="118,212 330,262"/>
    </g>

    <!-- Network nodes. -->
    <circle class="hero__node hero__d1" cx="118" cy="212" r="3.4"/>
    <circle class="hero__node hero__d2" cx="236" cy="146" r="3.0"/>
    <circle class="hero__node hero__d3" cx="330" cy="262" r="3.6"/>
    <circle class="hero__node hero__d4" cx="496" cy="126" r="3.0"/>
    <circle class="hero__node hero__d5" cx="560" cy="230" r="3.2"/>

    <!-- Satellites sitting on the orbital shells. -->
    <circle class="hero__sat hero__d2" cx="372" cy="180" r="4.6"/>
    <circle class="hero__sat hero__d4" cx="72"  cy="330" r="3.8"/>
  </svg>

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
    <svg class="topics__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
      <circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="7" r="2.2"/>
      <circle cx="12" cy="17" r="2.2"/><circle cx="12" cy="4" r="1.6"/>
      <path d="M7.1 6.6 16.9 6.9M6.2 7.9l4.7 7.3M17.8 8.9l-4.4 6.4M11 4.4 6.3 5.5M13 4.3l4.6 1.4"/>
    </svg>
    <h3 class="topics__h">Decentralized satellite networks</h3>
    <p class="topics__p">
      Coordination and consensus across a federation of independently operated
      spacecraft, without a single point of dependency.
    </p>
    <a class="topics__link" href="{{ base_path }}/publications/">6 papers &rarr;</a>
  </li>
  <li>
    <svg class="topics__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
      <rect x="3" y="9" width="6" height="6" rx="1.2"/><rect x="15" y="4" width="6" height="6" rx="1.2"/>
      <rect x="15" y="14" width="6" height="6" rx="1.2"/><path d="M9 11.4h6M9 13h6M15 7h-3v10h3"/>
    </svg>
    <h3 class="topics__h">Distributed task allocation</h3>
    <p class="topics__p">
      Scheduling observations under limited on-board computation, power and
      link budget &mdash; and what central nodes are actually worth.
    </p>
    <a class="topics__link" href="{{ base_path }}/publications/">4 papers &rarr;</a>
  </li>
  <li>
    <svg class="topics__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
      <path d="M2 12h3.5M18.5 12H22M12 2v3.5M12 18.5V22"/>
      <circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="7.6" stroke-dasharray="2.5 2.5"/>
    </svg>
    <h3 class="topics__h">Space situational awareness</h3>
    <p class="topics__p">
      Detecting and tracking resident space objects collaboratively, including
      with neuromorphic event cameras on the EventSat CubeSat.
    </p>
    <a class="topics__link" href="{{ base_path }}/publications/">7 papers &rarr;</a>
  </li>
  <li>
    <svg class="topics__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="10" ry="4"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(62 12 12)"/>
      <circle cx="12" cy="12" r="2.4"/><circle cx="21.3" cy="13.4" r="1.2"/><circle cx="6.4" cy="4.6" r="1.2"/>
    </svg>
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
