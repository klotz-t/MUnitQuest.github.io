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

See the [Participate!](/registration_and_submission/) page for the full guide. In short, a submission consists of:
- **EMG data in EMG-BIDS format** — raw signals and metadata. For guidance on preparing an EMG-BIDS dataset, see our [Tutorials](/resources/).
- **Labeled spike trains** — a `*_events.tsv` file per recording with labeled motor unit spikes
- **A 2-page PDF** — describing your labelling approach (experimental) or simulation model (synthetic)

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

### FAQ

- **Q:** Do I need to format my dataset in EMG-BIDS?     
  **A:** Yes, the submission portal will only accept data in EMG-BIDS format. We make getting started with EMG-BIDS as easy as possible through our tutorials. If you have additional questions on how to convert your dataset, do not hesitate to contact the organizers. 

- **Q:** My dataset has been published elsewhere. Can I still participate in the Data Challenge?     
  **A:** Of course! Reusing existing data makes a lot of sense anytime suitable data already exists. Just make sure to reference related papers or data repositories in your submission. 

- **Q:** How to deal with missing motor unit labels?     
  **A:** If there is any recording for which no motor unit spike labels exist, but you still want to include that recording for the sake of completeness, simply add an empty label file. The submission portal will display a warning to confirm that this did not happen accidentally.

- **Q:** Can I submit more than one dataset?     
  **A:** If you have more than one dataset that fits the purpose of the Data Challenge, we would be more than happy if you do so. Get in touch with the organizers for assistance.


  
