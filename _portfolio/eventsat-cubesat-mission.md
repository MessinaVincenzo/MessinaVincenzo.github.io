---
title: "EventSat CubeSat Mission"
excerpt: "Lead of the ADCS team and of the Thermal Control subsystem on a 6U CubeSat demonstrating neuromorphic event cameras for space object detection in low Earth orbit."
collection: portfolio
date: 2023-01-01
flag: "Flight mission"
status: "In development"
header:
  teaser: space-day-muenchen-2025.jpg
image_alt: 'The EventSat stand, with CubeSat structural models and mission posters'
image_credit: 'TUM ASG Chair of Spacecraft Systems'
---

<p class="project__role">
  <strong>Lead &mdash; ADCS team</strong> and <strong>Lead &mdash; Thermal Control subsystem</strong><br>
  Chair of Spacecraft Systems, Technical University of Munich &middot; 2023&ndash;present
</p>

**EventSat** is a 6U CubeSat technology demonstration mission built at the Chair of
Spacecraft Systems. It flies a commercial neuromorphic **event camera** to observe
stars, satellites and debris from a Sun-synchronous orbit, with onboard AI running
on an Nvidia Jetson Orin Nano.

Event cameras do not take frames. Each pixel reports a brightness *change*
asynchronously, at microsecond resolution and very low power, which lets the sensor
pick out objects that are dim and moving quickly &mdash; precisely the regime that
defeats a conventional frame camera in space situational awareness.

## What I lead

<div class="subsys">
  <section class="subsys__card">
    <h3 class="subsys__h">Attitude Determination &amp; Control</h3>
    <p class="subsys__role">Team lead</p>
    <p>
      I lead the ADCS team, which owns how the spacecraft knows and holds its
      orientation. For an observation mission the payload sets the hard
      requirement: the camera has to be pointed accurately enough, and held
      steadily enough, for the detections to mean anything.
    </p>
    <p>
      The work spans sensor and actuator selection, attitude determination and
      control design, closed-loop simulation against the mission's pointing
      budget, and verification of the assembled system. It also covers the
      flight-software interface to the ADCS hardware and the operational modes
      the spacecraft moves between in orbit.
    </p>
  </section>

  <section class="subsys__card">
    <h3 class="subsys__h">Thermal Control</h3>
    <p class="subsys__role">Subsystem lead</p>
    <p>
      I lead the thermal control subsystem. The event sensor and the Jetson
      compute module are the drivers here: the camera's noise behaviour depends
      on its temperature, and the onboard processing produces heat that a 6U
      structure has limited means to reject.
    </p>
    <p>
      The work covers the thermal requirements and design, thermal analysis
      across the orbital cases, heater design for the cold cases, and the
      thermal vacuum test campaign that validates the model against measured
      hardware behaviour.
    </p>
  </section>
</div>

I also support project management across the mission.

## Publications

The mission's published record, newest first. I am a co-author on the first three.

<ul class="selected">
  <li>
    <a class="selected__title" href="/publication/eventsat-cubesat-neuromorphic-vision-mission">EventSat: A CubeSat Mission for Neuromorphic Vision-Based Space Object Detection</a>
    <span class="selected__meta">The mission paper &middot; 5th Symposium on Space Educational Activities, 2026</span>
  </li>
  <li>
    <a class="selected__title" href="/publication/event-camera-payload-eventsat-design-analysis">Design and Analysis of an Event Camera Payload for Space-Based Object Detection on the EventSat 6U CubeSat Mission</a>
    <span class="selected__meta">Limiting visual magnitude, detectability and baffle design &middot; 15th IAA Symposium on Small Satellites, 2025</span>
  </li>
  <li>
    <a class="selected__title" href="/publication/event-based-cameras-space-situational-awareness">Leveraging Event-Based Cameras for Enhanced Space Situational Awareness: A Nanosatellite Mission Architecture Study</a>
    <span class="selected__meta">The mission architecture study &middot; 75th International Astronautical Congress, 2024</span>
  </li>
  <li>
    <a class="selected__title" href="https://mediatum.ub.tum.de/1833763">Neuromorphic Vision Sensor Noise Characterization and Detection for CubeSat Technology Demonstration Mission</a>
    <span class="selected__meta">Sensor noise and thermal testing, by L. Schuberth, S. Dolan and A. Golkar &middot; International Astronautical Congress, 2025</span>
  </li>
</ul>

The payload analysis puts the limiting apparent visual magnitude for the selected
sensor at roughly 7.7, and works through a single-stage baffle to keep stray light
from nearby bright bodies out of the aperture. The
[digital twin work](/publication/advancing-digital-twin-implementation-cubesats)
uses EventSat as its case study, mirroring payload power management with an
automated control loop.

## Supervised theses

Student work feeding the mission, from the digital twin and ADCS simulation to
the onboard compute and the magnetic test facility the spacecraft is verified in.

{% include thesis-entries.html theme="eventsat" %}
