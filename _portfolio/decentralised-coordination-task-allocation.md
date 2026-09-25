---
title: "Decentralised Coordination and Task Allocation"
excerpt: "How satellites belonging to different missions agree on who does what, without a ground-based scheduler deciding for them - and what that costs in latency, propellant and onboard resources."
collection: portfolio
date: 2023-01-01
---

**Role:** Doctoral research and thesis supervision &middot; Chair of Spacecraft Systems, Technical University of Munich

A distributed satellite system only becomes more than the sum of its spacecraft
if the spacecraft can decide among themselves which of them serves a given
request. This line of work treats that decision as an optimisation over a
**time-varying graph**: the network topology changes continuously with the
orbits, so the coordination scheme, not just the constellation geometry,
determines how quickly a task reaches the satellite best placed to execute it.

The recurring question is how much centralisation a network actually needs. Fully
centralised coordination is responsive but brittle and expensive in downlink;
fully decentralised coordination scales but converges slowly. A small fraction of
**central nodes** turns out to recover most of the responsiveness of a
centralised scheme while keeping the scalability of a decentralised one.

Related publications:
[Initial Formulation of a Time Varying Dynamic Graph Decentralized Optimization
Framework](/publication/time-varying-dynamic-graph-decentralized-optimization) (IAC 2023) &middot;
[Latency Optimization in Centralized and Decentralized Coordination of Time-Varying
Evolutionary Satellite Networks](/publication/latency-optimization-time-varying-satellite-networks) (IAC 2024) &middot;
[Efficient and Responsive Task Allocation in Distributed Satellite Systems: The Role
of Central Nodes](/publication/efficient-responsive-task-allocation-central-nodes) (IWPSS 2025) &middot;
[Advancing Federated Satellite Systems Performance: A Collaborative Method for
Improved Object Detection in Space](/publication/advancing-federated-satellite-systems-object-detection) (AIAA SciTech 2025) &middot;
[The Role of Central Nodes in Multi-Task Allocation](/publication/role-of-central-nodes-multi-task-allocation) (MASSpace, AAMAS 2026)

## Supervised theses

{% include thesis-entries.html theme="coordination" %}
