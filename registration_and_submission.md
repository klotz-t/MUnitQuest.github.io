---
title: Registration and submissions
feature_image: "https://raw.githubusercontent.com/MUnitQuest/MUnitQuest.github.io/refs/heads/main/Images/header2.jpeg"
feature_text: 
---

### Registration

The registration platform will be launched soon.


### Dataset submissions

To obtain a diverse data collection for MUnitQuest that balances realism and label quality, we invite submissions of both experimental and simulated data. In short, depending on the type of data you want to contribute, a submission consists of the following parts: 

![Submission Requirements](/Images/submissionRequirements.jpg)

- **EMG data and metadata:** We will provide the EMG data entering the competition in the standardized [EMG-BIDS](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electromyography.html) format. To make getting started with EMG-BIDS as easy as possible, we support two options for your data submission:
    - Upload of EMG-BIDS-formatted data, which we facilitate by providing tutorials (coming soon) that you can adopt according to your specific recording setup
    - Assisted generation of EMG-BIDS compatible metadata files through a web interface (coming soon)

- **Labeled motor unit spike trains:** A key requirement for a competition on motor unit identification methods is the availability of labeled ground truth spikes. Thus, we additionally require submitting:
    - for each recording, a *.tsv* file (BIDS-events file, see example below) containing the labeled motor unit spike trains 
    - a short description (2-page PDF) of the utilized labelling approach (for experimental EMG data) or the utilized simulation model (for synthetic EMG data)

Further details are coming soon.    

### Algorithm submission   

This is a prediction submission competition. During both **Phase 1** and **Phase 2**, you will be asked to upload, for each recording, a tabular file (*recordingName_events.tsv*) containing your predicted motor unit spikes (BIDS-events file) together with a log file (*recordingName_log.json*) describing essential process metadata (further details to be announced). To be eligible for awards, you need to share your code openly (e.g., on GitHub). 


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
 
