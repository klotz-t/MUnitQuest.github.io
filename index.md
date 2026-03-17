---
title:  Welcome to MUnitQuest
feature_image: "https://raw.githubusercontent.com/MUnitQuest/MUnitQuest.github.io/refs/heads/main/Images/header2.jpeg"
feature_text: 
---


### Aims and scope 

**MUnitQuest** aims to advance methods for reconstructing motor unit spike trains from high-density surface EMG (HDsEMG) through a community-driven competition. The competition will address two distinct algorithmic challenges, yielding two independent leaderboards:
   - **Challenge A1: Isometric contractions.** Well-studied, stationary conditions for which multiple neural source separation methods currently exist.
   - **Challenge A2: Dynamic contractions.** Less studied, non-stationary conditions in which algorithmic performance remains limited, motivating the development of novel approaches and interactive exchange of ideas.

This is only possible if the competition data includes reliably labeled motor unit spike trains as references. This requires a community-based effort in building a diverse database of experimental data and realistic simulations. We acknowledge this need through an additional challenge:
  - **Challenge D: Data collection.** Innovative approaches for obtaining high-quality data and labels for the validation and rigorous performance evaluation of neural source separation algorithms (assessed by a panel of experts).

### Who is it for

  - **Challenges A1 and A2** are intended for **algorithm developers** working on computational methods that can reconstruct the activity of single neurons from complex mixtures.
  - **Challenge D** is targeted at **experimental researchers** who use HDsEMG and **simulation scientists** developing electrophysiological models that want to apply their methods in a highly relevant field of applied neuromuscular research.       

### How does it work

The competition is organised into three phases (also see the [competition timeline](https://munitquest.github.io/timeline/)): 
  - **Phase 0 (Archive):** Community members contribute datasets (i.e., experimental or simulated HDsEMG data together with labeled spike trains), which are automatically standardised to the [EMG-BIDS format](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electromyography.html). Each submitted dataset is assessed via a double-blind review process (also serving as the basis for the awards in **Challenge D**). All datasets entering **Phase 2** will be released on an open data repository (for datasets not entering the competition's data collection, this remains optional).
  - **Phase 1 (Familiarization):** In parallel with **Phase 0**, algorithm developers are provided with training data from the [MUniverse benchmark collection](https://openreview.net/pdf?id=Slrp3l7aYo) (including labels), allowing teams to build, test, and optimize their neural source separation methods (for both **Challenge A1** and **A2**). To qualify for **Phase 2**, competitors must submit motor unit spike train predictions, which are evaluated through an anonymized temporary leaderboard. 
  - **Phase 2 (Showdown):** The main algorithm competition is conducted using the data collection established in **Phase 0** (whereby labels are hidden to competitors). Prize-eligible entries are required to share code at the end of the competition; submissions based on proprietary code are not eligible for awards. The final leaderboards for **Challenge A1** and **Challenge A2** will be based solely on performance during the showdown phase and publicly released (non-awarded teams can decide whether their identities remain hidden).



### Awards

All teams participating in **Challenges A1 and A2** receive recognition on a permanent leaderboard (per challenge), and all contributions from **Challenge D** will be published according to the FAIR (Findable, Accessible, Interoperable, Reusable) principles in an open data repository (mandatory for datasets entering the *MUnitQuest data collection*, optional otherwise). Furthermore, the top 5 teams per algorithmic challenge (**A1** and **A2**), as well as the top 5 dataset contributions (**Challenge D**), will be invited to share their solutions in a *special issue* of the [Journal of Electromyography and Kinesiology](https://www.sciencedirect.com/journal/journal-of-electromyography-and-kinesiology).

### Motivation and background

Since the development of the concentric needle by Adrian and Bronk nearly 100 years ago, the indirect identification of spinal motor neuron activity from motor unit activity has shaped our understanding of neuromuscular physiology.  Over the last 20 years, the development of blind source separation (BSS) algorithms applied to high-density surface electromyography (HDsEMG) recordings has facilitated the study of motor unit activity in living humans, enhanced the population of detectable motor units, and underscored the technique's potential in applications such as human-machine interfaces. Despite these achievements, several limitations persist:
-  Most motor unit identification algorithms are still limited to isometric conditions
-  Due to the lack of community-accepted benchmarks, tracking methodological progress is difficult
-  The lack of publicly available datasets and standards for sharing EMG data hinders large-scale performance evaluation through automated pipelines

### Organizing institutions


<p float="left">
  <img src="/Images/imperial_logo.png" width="200" />
  <img src="/Images/logo_empty.jpeg" width="30" />
  <img src="/Images/UniStuttgartLogo.png" width="200" />
</p>

- Institute for Modelling and Simulation of Biomechanical Systems, University of Stuttgart
- Department of Bioengineering, Imperial College London

### Partners and supporters

- Become a partner! Get in touch ([📧](mailto:MUnitQuest@outlook.com)) if you want to contribute to our efforts 🙏

### Core coordinators

- Pranav Mamidanna ([📧](mailto:p.mamidanna22@imperial.ac.uk), [GitHub](https://github.com/pranavm19))
- Thomas Klotz ([📧](mailto:thomas.klotz@imsb.uni-stuttgart.de), [GitHub](https://github.com/klotz-t))
- Robin Rohlen ([📧](mailto:r.rohlen@imperial.ac.uk))
- Oliver Röhrle ([📧](mailto:roehrle@simtech.uni-stuttgart.de))
- Dario Farina ([📧](mailto:d.farina@imperial.ac.uk))

### Contributors
- Niklas Enslin

