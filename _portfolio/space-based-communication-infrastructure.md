---
title: "Space-Based Communication Infrastructure"
excerpt: "Forecasting how much bandwidth space systems will need by 2060, and working backwards to the constellation architectures that could actually carry it."
collection: portfolio
date: 2024-09-01
scenes: true
---

**Role:** Research and thesis supervision &middot; Chair of Spacecraft Systems, Technical University of Munich

Most constellation studies start from an architecture and evaluate its
performance. This one runs the other way: start from **demand** - how much data
Earth observation, navigation, science and crewed programmes will need to move
through space in the coming decades - and ask which orbital and spectral
architectures could serve it.

Posed that way, the binding constraint is rarely the radio link. Coverage-to-cost
ratios separate the candidate architectures cleanly by altitude, inclination and
frequency band, but the ceiling on deploying any of them is **launch capacity**,
not spectrum or power. That makes infrastructure planning a question about the
launch market as much as about spacecraft design.

{% include orbital-scene.html
     kind="demand"
     ratio="wide"
     label="A clock running from 2025 to 2060 with the constellation filling in, beside a chart of data demand against deployable capacity under a launch ceiling."
     caption="Running the problem backwards: demand first, architecture second. As the clock runs to 2060 the fleet fills in, but deployable capacity flattens against what the <strong>launch market</strong> can put up &mdash; not against spectrum or power. The shaded gap is the shortfall, and it is the reason this is a launch-capacity question. Drag to rotate." %}

## Supervised theses

{% include thesis-entries.html theme="communication" %}
