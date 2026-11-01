---
title: "Satellite Navigation"
excerpt: "What a cooperative satellite network has to look like geometrically before it can deliver a navigation service - and why a three-plane LEO design cannot, whatever its size."
collection: portfolio
date: 2024-06-01
scenes: true
---

**Role:** Research and thesis supervision &middot; Chair of Spacecraft Systems, Technical University of Munich

If satellites can already trade communication and observation capacity, they can
in principle contribute ranging signals too. Whether that yields a usable
navigation solution is a question of **geometry** rather than of protocol: the
geometric dilution of precision depends on where the visible transmitters sit
relative to the receiver, and no amount of cooperation compensates for a bad
spread.

The work here maps that constraint across the design space - altitude, plane
count, inclination, receiver masking - to find which cooperative architectures
can support navigation as a secondary service, and which cannot regardless of
constellation size. The same tradespace logic carries over to dedicated
navigation constellations in cislunar space.

Related publications:
[Enhancing Navigation Accuracy through Cooperative Satellite Networks](/publication/enhancing-navigation-accuracy-cooperative-satellite-networks),
*IFAC-PapersOnLine*, 2025 &middot;
[Tradespace Analysis and Conceptual Design for a Lunar Navigation and Communication
Constellation](/publication/tradespace-analysis-lunar-navigation-constellation), IAC 2024.

{% include orbital-scene.html
     kind="navigation"
     ratio="wide"
     label="A receiver taking ranging measurements from the satellites above its horizon, with its position-error ellipse growing and shrinking as their geometric spread changes."
     caption="A receiver ranging against whichever satellites of a three-plane constellation are above its horizon. The <strong>PDOP</strong> in the readout is computed from the lines of sight actually drawn, and the error ellipse is drawn from it &mdash; so you can watch the fix degrade while the number of visible transmitters stays the same, purely because they have bunched together. Drag to rotate." %}

## Supervised theses

{% include thesis-entries.html theme="navigation" %}
