---
title: Welcome to MUnitQuest Competition
feature_image: "https://raw.githubusercontent.com/MUnitQuest/MUnitQuest.github.io/refs/heads/main/Images/header_new.jpg"
feature_text: |
  ## This website is under construction. For educational purposes only. All information is fictitious. 
---



### Summary, aims, and scope 

**MUnitQuest** aims to advance methods for reconstructing motor unit spike trains from high-density surface EMG (HDsEMG) through a community-driven competition by

  1. Building a diverse, high-quality, openly shared HDsEMG database with labelled spike trains
  2. Rigorously evaluate algorithms on this benchmark in a transparent, reproducible way

The competition will address two distinct algorithmic challenges:
   - **Challenge 1: Isometric contractions.** Well-studied, stationary conditions for which multiple decomposition methods currently exist.
   - **Challenge 2: Dynamic contractions.** Less studied, non-stationary conditions in which algorithmic performance remains limited, motivating the development of novel approaches and interactive exchange of ideas.

### How does it work

The competition is organised into three phases: 
  - **Phase 0: Archive.** Community members contribute datasets (i.e., experimental or simulated HDsEMG data together with labelled spike trains), which are automatically standardised to the [EMG-BIDS format](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electromyography.html) and assessed via a double-blind review process.
  - **Phase 1: Familiarization.** Algorithm developers are provided with training data (including labels), allowing teams to build, test, and optimize their motor unit identification frameworks.
  - **Phase 2: Showdown.** The main competition is conducted using a previously hidden test data set (labels are hidden to competitors). Prize-eligible entries are required to share code upon the end of the competition; submissions based on proprietary code are not eligible for awards. The final leaderboard is computed from test set performance and publicly released.

### Awards

Teams receive recognition on a permanent leaderboard (online), and the top 5 teams per challenge, as well as the top 5 dataset contributions, will be invited to share their solutions in a *special issue of the Journal of Electromyography and Kinesiology*.

### Motivation and background

Since the development of the concentric needle by Adrian and Bronk nearly 100 years ago, the indirect identification of spinal motor neuron activity from motor unit activity has shaped our understanding of neuromuscular physiology.  
In the last 20 years, the development of blind source separation (BSS) algorithms applied to high-density surface electromyography (HDsEMG) recordings has facilitated the study of motor unit activity in living humans, enhanced the population of detectable motor units, and underscored the technique's potential in applications such as human-machine interfaces \cite{Holobar2021}.  
Despite these achievements, several limitations persist:
  1. Most motor unit identification algorithms are still limited to isometric conditions
  2. Due to the lack of community-accepted benchmarks, tracking methodological progress is difficult
  3. In-house codes or proprietary packages prevent the exchange and comparison of solutions
  4. The lack of publicly available datasets and standards for sharing EMG data hinders large-scale performance evaluation through automated pipelines

### Organizing institutions

- University of Stuttgart
- Imperial College London

### Partners and supporters

- Become a partner 

### Core coordinators

- Pranav Mamidanna
- Thomas Klotz
- Robin Rohlen
- Oliver Röhrle
- Dario Farina

