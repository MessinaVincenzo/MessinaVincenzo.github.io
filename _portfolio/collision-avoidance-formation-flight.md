---
title: "Collision Avoidance and Formation Flight"
excerpt: "Letting spacecraft negotiate avoidance and reconfiguration manoeuvres between themselves, and scoring those manoeuvres on propellant, energy, timing and availability rather than on miss distance alone."
collection: portfolio
date: 2024-01-01
scenes: true
---

**Role:** Research and thesis supervision &middot; Chair of Spacecraft Systems, Technical University of Munich

Conjunction handling today is decided on the ground, one operator at a time. As
orbital density grows that pattern scales badly: the number of screenings rises
faster than the number of satellites, and each unilateral manoeuvre perturbs the
conjunction geometry for everyone else.

This work asks what changes when the spacecraft involved decide **cooperatively**
which of them manoeuvres, and how. Treating the manoeuvre as a shared optimisation
lets the cost be distributed - the satellite with propellant to spare moves,
rather than the one that happened to be flagged - and cuts the communication
overhead that centralised coordination imposes. The same machinery applies to
formation reconfiguration, where the trigger is a change in mission geometry
instead of a conjunction warning.

Related publication:
[Orbital Manoeuvring Optimization Techniques for Collision Avoidance through
Decentralized Algorithms](/publication/orbital-manoeuvring-optimization-collision-avoidance),
75th International Astronautical Congress, 2024.

{% include orbital-scene.html
     kind="formation"
     ratio="wide"
     label="Two orbits crossing, with an object on each due at the crossing point at the same time, shown next to a close-up of the encounter and the small manoeuvre that separates them."
     caption="Two views of the same conjunction, because it happens at two very different scales. On the left, two orbits that genuinely cross, with both objects due at the crossing point at the same moment. On the right, the encounter itself, a couple of kilometres across &mdash; the only scale at which a miss distance in metres means anything. The manoeuvre is a very small change in speed made an orbit ahead: it does not push the spacecraft aside, it changes when it arrives, so the two simply are no longer there together. Which of the two objects moves is the question this work is about. Drag the globe to rotate." %}

## Supervised theses

{% include thesis-entries.html theme="collision" %}
