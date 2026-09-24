---
permalink: /
author_profile: true
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

Hi! I am Vincenzo Messina and I am a Research Associate and Doctoral Candidate of
the Chair of Spacecraft Systems at the Technical University of Munich.

My research focuses on proposing and analysing methods for optimizing decentralized
satellite operations in distributed satellite systems (DSS), enabling satellites to
make decisions while ensuring consensus across the network, focusing on the strategic
exchange of observational tasks among satellites.

## Research interests

* **Decentralized satellite networks** &mdash; coordination and consensus across a
  federation of independently operated spacecraft.
* **Distributed satellite systems** &mdash; task allocation and scheduling under
  limited on-board computation and resources.
* **Satellite constellations** &mdash; network analysis, latency optimization and
  mission architecture trade studies.

{% if site.posts.size > 0 %}
## Latest news

<ul class="home-news">
{% for post in site.posts limit: 4 %}
  <li>
    <span class="home-news__date">{{ post.date | date: "%b %Y" }}</span>
    <a href="{{ base_path }}{{ post.url }}">{{ post.title }}</a>
  </li>
{% endfor %}
</ul>

<p><a href="{{ base_path }}/year-archive/">All news &rarr;</a></p>
{% endif %}
