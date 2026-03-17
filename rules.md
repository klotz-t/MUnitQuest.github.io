---
title: Rules
feature_image: "https://raw.githubusercontent.com/MUnitQuest/MUnitQuest.github.io/refs/heads/main/Images/header2.jpeg"
feature_text: 
---


### Rules of participation 

The competition is open to teams worldwide, with no restriction on team size. Each team must nominate a leader responsible for coordination and submission. Teams may compete in all three challenges (**A1**, **A2**, and **D**), or in a single challenge. Each person may only belong to one team per challenge. Each registered team may submit one contribution (a dataset or an algorithmic prediction) per challenge.

### Challenge D: Data review

To ensure the quality of the datasets used for **Challenges A1** and **A2**, and to obtain the scoring of **Challenge D**, we plan to conduct a double-blind review process by recruiting an expert panel (10-12 persons) that rates the datasets based on a set of pre-defined criteria:

- **Metadata and provenance** (10 percent) – verifies that submissions satisfy [CEDE](https://cede.isek.org/) reporting matrices, thereby guaranteeing reproducibility and downstream re-use.
- **Raw-signal quality** (40 percent) – gauges whether the HDsEMG signals are “decomposition-ready”. Key metrics include the baseline noise of each channel, residual power-line interference at 50/60 Hz, and the fraction of bad channels.
- **Label quality** (40 percent) – evaluates the quality and trustworthiness of the labeled motor unit spike trains. This includes the labeling approach (e.g., simultaneous invasive EMG) as well as established trustworthiness measures such as the silhouette score and interspike-interval variability. 
- **Diversity** (10 percent) – rewards datasets that expand anatomical, functional, and demographic coverage. Experienced reviewers rate the novelty of submissions in terms of recorded muscles, tasks, and recording configurations, including pathological as well as healthy cohorts, and balancing biological sex and age.

**Additional considerations for synthetic data:**
For simulations, the data quality can be precisely controlled, and spike train labels represent an unequivocal ground truth. Hence, during the data review phase, the review panel will evaluate the realism of the simulated spike trains and the underlying muscle model (80 percent of the dataset score). 

**Scoring:** During the double-blind review phase, reviewers will assign a score of 1-6 (1: strong reject, 2: reject, 3: borderline reject, 4: borderline accept, 5: accept, 6: strong accept) for each category.


### Challenge A1: Leaderboard
The scoring system will be announced soon.


### Challenge A2: Leaderboard
The scoring system will be announced soon.



