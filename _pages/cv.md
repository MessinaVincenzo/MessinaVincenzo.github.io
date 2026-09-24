---
layout: archive
title: "CV"
permalink: /cv/
author_profile: false
redirect_from:
  - /resume
  - /cv-json
  - /resume-json
---

{% include base_path %}

<link rel="stylesheet" href="{{ base_path }}/assets/css/cv-style.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

<style>
  .archive {
    width: 80%;
    margin: 0 auto;
    float: none;
    padding-right: 0;
  }

  @media (min-width: 80em) {
    .archive {
      width: 70%;
    }
  }
</style>

{% include cv-template.html %}

<div class="cv-container">
  <div class="cv-section">
    <p>
      See <a href="{{ base_path }}/publications/">Publications</a>,
      <a href="{{ base_path }}/teaching/">Teaching</a> and
      <a href="{{ base_path }}/portfolio/">Projects</a> for the full lists.
    </p>
  </div>
</div>

<div class="cv-download-links">
  <a href="{{ base_path }}/files/CV_VincenzoMessina_September2026.pdf" class="btn btn--primary">Download CV as PDF</a>
</div>
