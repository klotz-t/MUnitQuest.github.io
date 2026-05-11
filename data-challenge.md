---
layout: page
title: Data Challenge
feature_image: "/Images/header.jpeg"
feature_text: 
---

### What is it

The **Data Challenge** is a community-driven effort to build a diverse, high-quality collection of experimental and simulated HDsEMG datasets with reliably labeled motor unit spike trains. These datasets form the foundation of the Showdown Phase of the **Algorithm Challenge**.

To participate, register on [Codabench](https://www.codabench.org/) then navigate to the [Data challenge](https://www.codabench.org/competitions/15762/) page!

### Who is it for

The Data Challenge is targeted at **experimental researchers** who use HDsEMG and **simulation scientists** developing electrophysiological models who want to apply their methods in a highly relevant field of applied neuromuscular research.

### How does it work

Community members contribute datasets consisting of experimental or simulated HDsEMG data together with labeled motor unit spike trains. Submissions need to be prepared in the standardized [EMG-BIDS format](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electromyography.html) and are assessed via a double-blind review process by an expert panel. All datasets entering the *MUnitQuest data collection* will be released on an open data repository (for datasets not entering the collection, this remains optional).

See the [Submission and Registration](/registration_and_submission/) page for details on how to prepare and submit a dataset. To make getting started with EMG-BIDS as easy as possible, we provide tutorials (coming soon) and assisted generation of BIDS metadata files through a web interface (coming soon).

### Evaluation criteria

Each dataset is rated by the expert panel on the following criteria:

- **Metadata and provenance** (10%) – verifies that submissions satisfy [CEDE](https://cede.isek.org/) reporting matrices, thereby guaranteeing reproducibility and downstream re-use.
- **Raw-signal quality** (30%) – gauges whether the HDsEMG signals are "decomposition-ready". Key metrics include the baseline noise of each channel, residual power-line interference at 50/60 Hz, and the fraction of bad channels.
- **Label quality** (40%) – evaluates the quality and trustworthiness of the labeled motor unit spike trains. This includes the labeling approach (e.g., simultaneous invasive EMG) as well as established trustworthiness measures such as the silhouette score and interspike-interval variability.
- **Diversity** (20%) – rewards datasets that expand anatomical, functional, and demographic coverage. Experienced reviewers rate the novelty of submissions in terms of recorded muscles, tasks, and recording configurations, including pathological as well as healthy cohorts, and balancing biological sex and age.

**Additional considerations for synthetic data:** For simulations, the data quality can be precisely controlled, and spike train labels represent an unequivocal ground truth. Hence, the review panel will evaluate the realism of the simulated spike trains and the underlying muscle model (80% of the dataset score).

**Scoring:** Reviewers assign a score of 1–6 (1: strong reject, 2: reject, 3: borderline reject, 4: borderline accept, 5: accept, 6: strong accept) for each category.

### Awards

All accepted data contributions will be published according to the FAIR (Findable, Accessible, Interoperable, Reusable) principles in an open data repository. All accepted dataset contributions will also be invited to share their work in a collaborative data paper in a special issue of the [Journal of Electromyography and Kinesiology](https://www.sciencedirect.com/journal/journal-of-electromyography-and-kinesiology).
