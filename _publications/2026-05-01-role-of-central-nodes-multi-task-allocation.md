---
title: 'The Role of Central Nodes in Multi-Task Allocation for Distributed Space-Based Observation Systems'
collection: publications
category: workshop
category_label: 'Workshop paper'
featured: true
permalink: /publication/role-of-central-nodes-multi-task-allocation
date: 2026-05-25
venue: 'International Workshop on Autonomous Agents and Multi-Agent Systems for Space Applications (MASSpace-26), AAMAS'
venue_short: 'MASSpace-26 @ AAMAS'
location: 'Paphos, Cyprus'
authors: '**Vincenzo Messina**, Marco Camporeale, Rob A. Vingerhoeds, Alessandro Golkar'
author_list:
  - 'Vincenzo Messina'
  - 'Marco Camporeale'
  - 'Rob A. Vingerhoeds'
  - 'Alessandro Golkar'
paperurl: 'https://hal.science/hal-05759879v1/document'
landing: 'https://hal.science/hal-05759879v1'
topics:
  - 'Decentralized Coordination'
  - 'Federated Satellite Systems'
has_abstract: true
citation: 'V. Messina, M. Camporeale, R. A. Vingerhoeds, A. Golkar (2026). "The Role of Central Nodes in Multi-Task Allocation for Distributed Space-Based Observation Systems." <i>International Workshop on Autonomous Agents and Multi-Agent Systems for Space Applications (MASSpace-26), AAMAS</i>.'
bibtex: |-
  @inproceedings{messina2026centralnodes,
    author    = {Vincenzo Messina and Marco Camporeale and Rob A. Vingerhoeds and Alessandro Golkar},
    title     = {{The Role of Central Nodes in Multi-Task Allocation for Distributed Space-Based Observation Systems}},
    booktitle = {Proceedings of the International Workshop on Autonomous Agents and Multi-Agent Systems for Space Applications (MASSpace-26), AAMAS},
    year      = {2026}
  }
---

This work presents a reward-based selective propagation algorithm that enables distributed agents to evaluate, exchange, and bid task-specific reward functions while minimizing communication overhead. Distributed observation satellites in a Walker-Delta constellation exchange multiple tasks of observing target objects in Sun-Synchronous Orbits. We analyze the impact of the number of satellites, the number of target objects, and the fraction of central nodes on the task’s diffusion, task performance quality, and bidding status over time.We investigate constellations with up to 5,000 satellites and 500 concurrent target objects, with a fraction of the central nodes ranging from 1% to 100% of the total number of satellites. Results show that the proposed framework maintains high performance and fast convergence even under heavy task loads, with convergence times below 100 s for networks with as few as 5% central nodes. Increasing the number of satellites reduces the required central node fractions to achieve faster convergence, suggesting that a minimum absolute number of central nodes is required to achieve maximum network responsiveness for the given constellation geometry. We identified a power-law relationship among network size, central node fraction, and link efficiency, offering valuable insights into architectural trade-offs for future Distributed Satellite Systems.
