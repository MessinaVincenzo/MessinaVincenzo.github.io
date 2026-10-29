---
title: "Decentralised Coordination and Task Allocation"
excerpt: "My doctoral research: how satellites belonging to different missions agree among themselves who does what, without a ground-based scheduler deciding for them — and what that costs in latency, propellant and onboard resources."
collection: portfolio
date: 2023-01-01
featured: true
flag: "Doctoral research"
status: "Active"
---

<p class="project__role">
  <strong>Doctoral research</strong> &middot; principal line of work<br>
  Chair of Spacecraft Systems, Technical University of Munich &middot; 2023&ndash;present
</p>

A distributed satellite system only becomes more than the sum of its spacecraft if
the spacecraft can decide among themselves which of them serves a given request.
My doctorate treats that decision as an optimisation over a **time-varying graph**:
the network topology changes continuously with the orbits, so the coordination
scheme &mdash; not just the constellation geometry &mdash; determines how quickly a
task reaches the satellite best placed to execute it.

The recurring question is **how much centralisation a network actually needs**.
Fully centralised coordination is responsive but brittle and expensive in downlink;
fully decentralised coordination scales but converges slowly. A small fraction of
*central nodes* turns out to recover most of the responsiveness of a centralised
scheme while keeping the scalability of a decentralised one.

## Three threads

<div class="subsys">
  <section class="subsys__card">
    <h3 class="subsys__h">Time-varying graph coordination</h3>
    <p class="subsys__role">Formulation</p>
    <p>
      Modelling the constellation as a graph whose edges appear and disappear
      with the orbital geometry, and optimizing operations over it without a
      central scheduler. This is where the doctorate started, at IAC 2023.
    </p>
  </section>

  <section class="subsys__card">
    <h3 class="subsys__h">Selective propagation &amp; central nodes</h3>
    <p class="subsys__role">Core contribution</p>
    <p>
      Each satellite scores an opportunity with a reward function; only the
      satellite ID and the best score cross the network, never the observation
      data. Scaled to 5,000 satellites and 500 concurrent targets, this reveals
      a power-law between network size, central-node fraction and link
      efficiency &mdash; with convergence under 100&nbsp;s at just 5% central nodes.
    </p>
  </section>

  <section class="subsys__card">
    <h3 class="subsys__h">Federated satellite systems</h3>
    <p class="subsys__role">Application</p>
    <p>
      Applying the same machinery across satellites owned by *different*
      operators, which have to cooperate without surrendering autonomy &mdash;
      quantified against real inter-satellite link and onboard resource
      constraints, including a time-critical disaster-response case.
    </p>
  </section>
</div>

## Publications

<ul class="selected">
  <li>
    <a class="selected__title" href="/publication/role-of-central-nodes-multi-task-allocation">The Role of Central Nodes in Multi-Task Allocation for Distributed Space-Based Observation Systems</a>
    <span class="selected__meta">Multi-task selective propagation at scale &middot; MASSpace-26 @ AAMAS, 2026</span>
  </li>
  <li>
    <a class="selected__title" href="/publication/efficient-responsive-task-allocation-central-nodes">Efficient and Responsive Task Allocation in Distributed Satellite Systems: The Role of Central Nodes</a>
    <span class="selected__meta">How few central nodes a system needs &middot; IWPSS 2025</span>
  </li>
  <li>
    <a class="selected__title" href="/publication/advancing-federated-satellite-systems-object-detection">Advancing Federated Satellite Systems Performance: A Collaborative Method for Improved Object Detection in Space</a>
    <span class="selected__meta">The Collaborative Satellite Network method &middot; AIAA SciTech 2025</span>
  </li>
  <li>
    <a class="selected__title" href="/publication/latency-optimization-time-varying-satellite-networks">Latency Optimization in Centralized and Decentralized Coordination of Time-Varying Scaled Satellite Networks</a>
    <span class="selected__meta">What data size does to coordination latency &middot; IAC 2024</span>
  </li>
  <li>
    <a class="selected__title" href="/publication/time-varying-dynamic-graph-decentralized-optimization">Initial Formulation of a Time Varying Dynamic Graph Decentralized Optimization Framework</a>
    <span class="selected__meta">Where the doctorate began &middot; IAC 2023</span>
  </li>
</ul>

Related work applies the same ideas to
[cooperative navigation](/publication/enhancing-navigation-accuracy-cooperative-satellite-networks),
[network analysis of federated systems](/publication/advancing-satellite-network-performance) and
[multi-agent reinforcement learning](/publication/autonomous-decision-making-multi-agent-reinforcement-learning).

## Supervised theses

{% include thesis-entries.html theme="coordination" %}
