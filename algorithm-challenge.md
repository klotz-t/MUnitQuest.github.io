---
layout: page
title: Algorithm Challenge
feature_image: "/Images/header.jpeg"
feature_text: 
---

### What is it

The **Algorithm Challenge** is a competition to advance methods that reconstruct motor unit spike trains from high-density surface EMG (HDsEMG). It consists of two independent **tasks** and two sequential **phases**.

To participate, register on [Codabench](https://www.codabench.org/), then navigate to the [Algorithm challenge](https://www.codabench.org/competitions/15749/) page!

### Tasks

Competitors may participate in one or both tasks:

- **Isometric task.** Well-studied, stationary conditions for which multiple neural source separation methods currently exist.
- **Dynamic task.** Less studied, non-stationary conditions in which algorithmic performance remains limited, motivating the development of novel approaches and interactive exchange of ideas.

Each task yields an independent leaderboard.

### Phases

#### Familiarization Phase

Running in parallel with the Data Challenge, algorithm developers are provided with test data for the [**Isometric Task**](https://doi.org/10.18419/DARUS-6143) and the [**Dynamic Task**](https://doi.org/10.18419/DARUS-6144) to build, test, and optimize their motor unit identification algorithms. 

- Participants can compete in both tasks or in only one task
- Competitors upload their predictions (motor unit spike trains) through the algorithm submission portal 
- A preliminary leaderboard is provided as feedback
- Results from baseline algorithms (coming soon) are provided for reference
- Participation in the Familiarization phase is encouraged by the organizers

#### Showdown Phase

The main algorithm competition, conducted using the *MUnitQuest data collection* established during the Data Challenge (labels hidden from competitors). Note that the organizers may make minor alterations to the test data (e.g., injected noise, signal cropping) to limit the advantage teams gain from also participating in the Data Challenge.

- Submission of predicted motor unit spike trains for each recording
- To be eligible for awards, competitors need to share their code openly (e.g., using GitHub); submissions based on proprietary code are not eligible for awards
- The final leaderboards for the Isometric and Dynamic tasks will be based solely on performance during the Showdown Phase and will be publicly released 

See the [Submission and Registration](/registration_and_submission/) page for details on how to submit predictions.

### Leaderboard scoring

#### Familiarization phase

The [**Isometric Familiarization Data Collection**](https://doi.org/10.18419/DARUS-6143) is a mixture of simulated data with univocal ground-truth labels and experimental data with expert-curated — yet incomplete — labels (100 recordings in total). 

The [**Dynamic Familiarization Data Collection**](https://doi.org/10.18419/DARUS-6144) is based on 100 simulated HDsEMG recordings with univocal ground truth.

For the scoring, we perform the following steps:

- ``(1) Remove duplicate spike trains:`` A duplicate motor unit is detected if two spike trains share at minimum 30 percent of common spikes. In the case of duplicates, we will keep the first unit and reject all other units.
- ``(2) Match predicted and ground truth spike trains:`` Compute for all pairs of predicted and ground truth spike trains the F1-score and match labels by solving a linear sum assignment problem. We require a minimum F1-score of 50 percent.
- ``(3) Label-based score:`` The label-based score of each recording is the sum of all accepted units weighted by their respective F1-score. 

For all isometric recordings with incomplete labels, we additionally perform the following steps for obtaining model-based confidence scores for unmatched sources:

- ``(4) Supervised Fitting of a CBSS Model:`` We use a convolutive blind source separation model (extension factor: 12) and learn the unmixing weights given the predicted spike labels. As there are multiple delayed copies of the same spike train, we will consider all delays within a window of plus/minus 0.1 seconds and use the unmixing weights that yield the highest silhouette-like score. 
- ``(5) Additional metrics:`` To further evaluate the plausibility of the predicted sources, we calculate the pulse-to-noise ratio and the coefficient of dispersion (median absolute deviation divided by the median) of the interspike intervals. 
- ``(6) Bad source rejection:`` All sources with less than 10 spikes or a silhouette-like score below 0.9 are rejected.
- ``(7) Map quality metrics to confidence scores:`` To map the quality metrics (silhouette score, pulse-to-noise-ratio, and the coefficient of dispersion of the interspike intervals) to a normalized confidence score between zero and one, we use a data-driven mapping given in the following table. 
- ``(8) Model-based score:`` To get the model-based score, we compute for each predicted motor unit the mean value of the three metric-based confidence scores and sum these values. 
 
The ``recording score`` is the label-based score plus (if the labels are incomplete) the model-based score. Finally, the ``submission score`` is the average of the ``recording scores`` for the respective task (missing prediction files yield a ``recording score`` of zero).

The scoring system implementation is publicly available on [GitHub](https://github.com/MUnitQuest/munitquest-algorithm-submission).

#### Showdown phase

There might be small modifications in the scoring system for the showdown phase. 

### Awards

All teams receive recognition on a permanent leaderboard (per task). The **top 5 teams per task** (Isometric and Dynamic) will be invited to share their solutions in a *special issue* of the [Journal of Electromyography and Kinesiology](https://www.sciencedirect.com/journal/journal-of-electromyography-and-kinesiology). All winning teams will also be invited to share their work in a collaborative benchmarking paper in the same special issue!

