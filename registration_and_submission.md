---
layout: page
title: Registration and submissions
feature_image: "/Images/header.jpeg"
feature_text: 
---


Both the **Data Challenge** and the **Algorithm Challenge** are hosted on [Codabench](https://www.codabench.org/). To participate, register on Codabench, then navigate to the [Data challenge](https://www.codabench.org/competitions/15762/) and [Algorithm challenge](https://www.codabench.org/competitions/15749/)!

## Data Challenge

### Dataset submissions

To obtain a diverse data collection for MUnitQuest that balances realism and label quality, we invite submissions of both experimental and simulated data. In short, depending on the type of data you want to contribute, a submission consists of the following parts: 

<table class="submission-req">
  <colgroup>
    <col style="width: 30%">
    <col style="width: 40%">
    <col style="width: 30%">
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
      <td style="border-bottom: 1px solid #ccc;">Experimental HDsEMG</td>
      <td rowspan="3">
        1. Raw EMG signals<br>
        2. Labelled motor unit spike trains<br>
        3. Force and/or kinematics data<br>
        4. Metadata and provenance
      </td>
      <td style="border-bottom: 1px solid #ccc;">Labelling approach (2-page PDF)</td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #ccc;">Experimental HDsEMG + concurrent iEMG</td>
      <td style="border-bottom: 1px solid #ccc;">Raw iEMG signals must be provided; Labelling approach (2-page PDF)</td>
    </tr>
    <tr>
      <td>Synthetic (end-to-end, or hybrid)</td>
      <td>Model summary (2-page PDF)</td>
    </tr>
  </tbody>
</table>

**EMG data and metadata:** Data needs to be submitted in the standardized [EMG-BIDS](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electromyography.html) format. To make getting started with EMG-BIDS as easy as possible, we provide
- tutorials (coming soon) that you can adopt according to your specific recording setup
- a web interface for the assisted generation of BIDS datasets (coming soon)

**Labeled motor unit spike trains:** A key requirement for a competition on motor unit identification methods is the availability of labeled ground truth spikes. Thus, we additionally require submitting:
- for each recording, a *.tsv* file (BIDS-events file, see example below) containing the labeled motor unit spike trains 
- a short description (2-page PDF) of the utilized labelling approach (for experimental EMG data) or the utilized simulation model (for synthetic EMG data)

Further details are coming soon.    

## Algorithm Challenge

### Algorithm submission

This is a prediction submission competition. During both the **Familiarization Phase** and the **Showdown Phase**, you will be asked to upload, for each recording, a tabular file (`recordingName_events.tsv`) containing your predicted motor unit spikes (BIDS-events file) together with a log file (`recordingName_log.json`) describing essential process metadata (further details to be announced). Submissions apply to both tasks (**Isometric** and **Dynamic**) independently. To be eligible for awards, you need to share your code openly (e.g., on GitHub) upon the completion of the competition.


### Example: how to report motor unit spike trains

Here is a minimal example of the format ([BIDS-event file](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files/events.html)) used for submitting motor unit spike trains (both for labels and algorithm predictions):    

| **onset** | **duration** | **sample** | **unit_id** | **description** |
| --------- | ------------ | ---------- | ----------- | ----------------------|
| 0.001     | 0            | 1          | 0           | motor-unit-spike      |
| 0.005     | 0            | 5          | 1           | motor-unit-spike      |
| 0.011     | 0            | 11         | 0           | motor-unit-spike      |
| 0.012     | 0            | 12         | 2           | motor-unit-spike      |
| 0.016     | 0            | 16         | 1           | motor-unit-spike      |
| ...       | ...          | ...        | ...         | ...      |

- *onset*: Onset (in seconds) of the event, measured from the beginning of the acquisition.
- *duration*: Duration of the event (measured from onset) in seconds. As a motor unit spike can be regarded as a Dirac impulse, its duration is zero.  
- *sample*: Sample index of the event onset (zero-indexing).
- *unit_id*: Unique identifier (integer value) of the motor unit corresponding to the detected spike.
- *description*: Human-readable free-text description of the event.
 
