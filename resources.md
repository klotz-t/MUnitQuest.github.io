---
layout: page
title: Resources
feature_image: "/Images/header.jpeg"
---

All tutorials and reference material are available both below and in the [MUnitQuest Tutorials](https://github.com/MUnitQuest/MUnitQuest_tutorials) repository on GitHub. As registration and submission are handled through Codabench, dedicated platform tutorials are included alongside the technical content below.

### Codabench

[Codabench](https://www.codabench.org/) is an open-source platform for data science competitions and is used in **MUnitQuest** to handle submissions to both the [Data challenge](/data-challenge/) and the [Algorithm challenge](/algorithm-challenge/). We provide a Codabench Tutorial to help you learn how to register on Codabench, form a Team, make a submission, etc.   

[Go to the Codabench Tutorial →](https://github.com/MUnitQuest/MUnitQuest_tutorials/blob/main/codabench_tutorials/codabench_tutorial.md)

### Data Challenge

We provide tutorials and tools to guide you through building your first [EMG-BIDS](https://bids-specification.readthedocs.io/en/latest/modality-specific-files/electromyography.html) dataset. 

#### MUnitQuest EMG-BIDS Tutorial

A step-by-step guide covering how to prepare an HD-EMG dataset in EMG-BIDS format and organize your labeled spike trains (Steps 1 and 2 of the [submission process](/registration_and_submission/)). We developed a simplified approach tailored to typical HD-EMG recordings, walking through five simple CSV template files that generate a complete set of BIDS metadata files, with Python and MATLAB code throughout.

[Go to the Walkthrough →](/walkthrough/)

#### MUnitQuest EMG-BIDS Metadata Tool

An online form that takes your five filled-in CSV files and produces a `metadata.zip` containing all BIDS sidecar files, ready to accompany your recordings.

[Open the Metadata Tool →](/metadata-form/)

#### MUniverse EMG-BIDS Tutorial (Python)

The Python-based [MUniverse package](https://github.com/dfarinagroup/muniverse/tree/main) includes a set of classes for handling EMG-BIDS datasets. For example, to read, write, and validate a dataset/recording. We provide a tutorial illustrating how to use these utilities to generate your own EMG-BIDS dataset, including motor unit spike labels.  

[Open the Jupyter Notebook Tutorial →](/tutorials/emg_bids_tutorial2.html)

#### BIDS documentation, Examples and Tools

For a deep dive into EMG-BIDS, check out the [BIDS documentation](https://bids-specification.readthedocs.io/en/stable/) and the [BIDS examples](https://github.com/bids-standard/bids-examples). 

Examples of publicly available EMG-BIDS datasets can be found, e.g., in the [MUniverse data collection](https://dataverse.harvard.edu/dataverse/muniverse-datasets) or on [NEMAR](https://nemar.org/dataexplorer).

The [online BIDS validator](https://bids-standard.github.io/bids-validator/) allows you to verify your own BIDS dataset. A list of tools to handle BIDS datasets can be found [here](https://bids.neuroimaging.io/tools/others.html).

---

### Algorithm Challenge

Jupyter notebooks to help algorithm developers get started with the MUnitQuest training data and submission pipeline.

*Coming soon.*
