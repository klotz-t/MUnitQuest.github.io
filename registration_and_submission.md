---
layout: page
title: "Participate in MUnitQuest!"
feature_image: "/Images/header.jpeg"
feature_text: 
---


Both the **Data Challenge** and the **Algorithm Challenge** are hosted on [Codabench](https://www.codabench.org/). To participate, register on Codabench, then navigate to the [Data challenge](https://www.codabench.org/competitions/15762/) and [Algorithm challenge](https://www.codabench.org/competitions/15749/)!

### Data Challenge

#### Submission types

To obtain a diverse data collection for MUnitQuest that balances realism and label quality, we invite submissions of both experimental and simulated data. In short, depending on the type of data you want to contribute, a submission consists of the following parts: 

<div class="table-scroll">
<table class="submission-req">
  <colgroup>
    <col style="width: 25%">
    <col style="width: 37%">
    <col style="width: 38%">
  </colgroup>
  <thead>
    <tr>
      <th>Data type</th>
      <th>Submission requirements</th>
      <th>Additional considerations</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Experimental HDsEMG</td>
      <td rowspan="3">
        1. Raw EMG signals<br>
        2. Labelled motor unit spike trains<br>
        3. Force and/or kinematics data<br>
        4. Metadata and provenance
      </td>
      <td>Labelling approach (2-page PDF)</td>
    </tr>
    <tr>
      <td>Experimental HDsEMG + concurrent iEMG</td>
      <td>Raw iEMG signals must be provided; Labelling approach (2-page PDF)</td>
    </tr>
    <tr>
      <td>Synthetic (end-to-end, or hybrid)</td>
      <td>Model summary (2-page PDF)</td>
    </tr>
  </tbody>
</table>
</div>

#### How to prepare your submission

**Step 1 — Prepare your EMG data in EMG-BIDS format**
Data must be submitted in the standardized [EMG-BIDS](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electromyography.html) format. To make getting started with EMG-BIDS as easy as possible, check out our [Tuorials](/resources/); we showcase different ways to prepare an EMG-BIDS dataset. 

**Step 2 — Prepare your labeled spike trains**
For each recording, provide a `*_events.tsv` file (BIDS-events file) containing the labeled motor unit spike trains. See the [example below](#example-how-to-report-motor-unit-spike-trains) for the required format. The [Tutorials](/resources/) cover how to assemble these into your BIDS dataset.

**Step 3 — Write a 2-page PDF**
Include a short description of your dataset and labeling approach (for experimental data) or simulation model (for synthetic data). For concurrent iEMG submissions, describe how the invasive reference was used. This PDF will be placed at the root of your final submission (see Step 5). Use our [submission template](https://www.overleaf.com/read/vdxkshdfdsms#17d25e) as a starting point.

**Step 4 — Upload a metadata-only zip to Codabench**
Prepare a `.zip` of your BIDS dataset that excludes all raw data files (`.edf` or `.bdf`) and upload it to the [Data Challenge on Codabench](https://www.codabench.org/competitions/15762/). You can use the following shell command from the parent directory of your BIDS dataset folder:

```shell
zip -r submission_metadata.zip <your_bids_folder>/ --exclude "*.edf" --exclude "*.bdf"
```

After processing, you will be able to download an HTML report of your submission — review it to confirm everything is in order before proceeding.

> **Note:** Make sure that your `.zip` archive contains a single folder with the name of your dataset!

**Step 5 — Upload the full dataset**
If your Step 4 submission is successful, a link will be provided to upload the complete dataset (including the raw `.edf` files) together with your 2-page PDF placed at the root of the submission.

### Algorithm Challenge

#### Algorithm submission

This is a prediction submission competition. During both the **Familiarization Phase** and the **Showdown Phase**, you will be asked to upload, for each recording, a tabular file (`*desc-decomposed_events.tsv`) containing your predicted motor unit spikes (BIDS-events file) together with a log file (`*desc-decomposed_log.json`) describing essential process metadata (further details to be announced). Submissions apply to both tasks (**Isometric** and **Dynamic**) independently. To be eligible for awards, you need to share your code openly (e.g., on GitHub) upon the completion of the competition.


#### How to report motor unit spike trains

Here is a minimal example of the format ([BIDS-event file](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files/events.html)) used for submitting motor unit spike trains (both for labels and algorithm predictions):    

| **onset** | **duration** | **sample** | **unit_id** | **description** |
| --------- | ------------ | ---------- | ----------- | ----------------------|
| 0.001     | 0            | 1          | 0           | motor-unit-spike      |
| 0.005     | 0            | 5          | 1           | motor-unit-spike      |
| 0.011     | 0            | 11         | 0           | motor-unit-spike      |
| 0.012     | 0            | 12         | 2           | motor-unit-spike      |
| 0.016     | 0            | 16         | 1           | motor-unit-spike      |
| ...       | ...          | ...        | ...         | ...      |

- ``onset:`` Onset (in seconds) of the event, measured from the beginning of the acquisition.
- ``duration:`` Duration of the event (measured from onset) in seconds. As a motor unit spike can be regarded as a Dirac impulse, its duration is zero.  
- ``sample:`` Sample index of the event onset (zero-indexing).
- ``unit_id:`` Unique identifier (integer value) of the motor unit corresponding to the detected spike.
- ``description:`` Human-readable free-text description of the event. Here, it should always be "motor-unit-spike".

> If you do manual post-processing, we encourage using an additional column ``curation_status`` (optional), and assigning each event a label such as ``accepted_spike``, ``rejected_spike``, or ``added_spike``. For rejected spikes, change the description to a key such as ``artifact`` or ``MISC`` (the scoring function will only consider events that have the description ``motor-unit-spike``).   

#### How to report process metadata

Here is a minimal example for the log-file:

```json
{
    "GeneratedBy": [{
        "Name": "MUnitQuest Tutorials",
        "Description": "Minimal Example",
        "CodeURL": "https://munitquest.github.io/",
        "License": "MIT",
    }],
    "Execution": {
        "Runtime": 42,   
    },
    "RuntimeEnvironment": {
        "CPU": "CPU Info",
        "GPU": "GPU Info",
        "RAM": "RAM in GB"
    }
}
```

The runtime is the total wall-clock execution time for your algorithm (in seconds, reported as a number). The CodeURL is required even if your repository is private — it is used to verify algorithm identity, not to access the code.


 
