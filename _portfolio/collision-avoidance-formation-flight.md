---
title: "Collision Avoidance and Formation Flight"
excerpt: "Letting spacecraft negotiate avoidance and reconfiguration manoeuvres between themselves, and scoring those manoeuvres on propellant, energy, timing and availability rather than on miss distance alone."
collection: portfolio
date: 2024-01-01
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

## Supervised theses

{% include thesis-entries.html theme="collision" %}
