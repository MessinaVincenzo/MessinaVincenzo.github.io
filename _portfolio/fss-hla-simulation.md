---
title: "HLA-Based Simulation for Federated Satellite Systems"
excerpt: "A distributed IEEE 1516 (HLA) simulator for a 100-CubeSat Federated Satellite System, used to characterise inter-satellite links under real operational constraints and to test disaster-response rapid mapping."
collection: portfolio
date: 2023-09-01
---

**Role:** Thesis supervision &middot; Chair of Spacecraft Systems, Technical University of Munich

In a Federated Satellite System (FSS), satellites belonging to different missions
and operators trade resources in a market-based network to pursue a shared goal.
Testing that idea properly needs a simulator in which a satellite's communication
capability is tied to its actual operational state - power, attitude, pointing -
rather than assumed.

This project built that simulator on the **IEEE 1516 High Level Architecture**
standard, using the open-source CERTI run-time infrastructure so that multiple
simulators, FlatSats and digital twins can co-simulate one scenario in a
synchronised way. Each satellite subsystem (ADCS, EPS, TMTC) is a C++ class with
its own propagation, and the architecture was extended to Hardware-In-the-Loop
through a radio module on a Raspberry Pi.

A 100 CubeSat federation was then analysed as a directed, SNR-weighted network:

* **Goodput per link**, time-averaged across a 24-hour window under different
  operational hypotheses.
* **Time To Spread (TTS)** - how long a single message takes to reach every node -
  which behaves much like an epidemic curve, with an exponential start and a long
  tail of poorly connected satellites. Message multiseeding and a spreading cutoff
  cut the average TTS from 5.3 to about 3.4 hours.
* **Katz dynamic centrality** as a cheap predictor of TTS, avoiding a
  computationally expensive Monte Carlo sweep.

The network was then tested against a real time-critical scenario: the Copernicus
Emergency Management Service rapid-mapping request for the **Emilia-Romagna floods
of May 2023**, with satellites bidding for the imaging task using an onboard reward
function balancing sun elevation, cloud cover, battery state and slew cost.

The headline finding is that tying inter-satellite links to real operational
constraints degrades network communicability well below what the literature
assumes - but not so far as to invalidate the FSS paradigm for disaster response.

Related publication: [Advancing Satellite Network Performance: Network Analysis for
Federated Satellite Systems](/publication/advancing-satellite-network-performance),
*IEEE Access*, 2024.
