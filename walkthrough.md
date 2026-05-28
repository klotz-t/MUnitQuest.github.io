---
title: "MUnitQuest EMG-BIDS Tutorial"
feature_image: "/Images/header.jpeg"
layout: page
---


### Getting Started

This tutorial covers how to prepare an HD-EMG dataset in [EMG-BIDS](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electromyography.html) format and organise your labeled spike trains. It covers **Steps 1 and 2** of the [MUnitQuest dataset submission process](/registration_and_submission/).

The process has two stages: first, we fill in five simple CSV files that capture everything BIDS needs to know about the dataset — participants, recordings, hardware, electrode layout, and coordinate systems. Second, we upload those CSVs into the [MUnitQuest Metadata tool](/metadata-form/) — along with a short online form for dataset-level details — and download a ZIP containing all the generated metadata files.

> **Follow along on GitHub!** The CSV files, the source data files and the python scripts used to assemble the BIDS data are available in this [MUnitQuest_Tutorial](https://github.com/MUnitQuest/MUnitQuest_tutorials/tree/main/emg_bids_tutorial1) repository!

#### Prerequisites

- A version of the dataset you would like to submit (or archive for your own purposes!)
- Some familiarity with MATLAB or Python
- Some familiarity with how your EMG acquisition device stores data

#### Example dataset

We will walk through preparing a dataset with 2 subjects and 10 recordings in total, where
- Subject 1 took part in a single experimental session, during which we recorded HD-EMG signals from the right vastus lateralis using a 3 × 4 electrode grid. A single intramuscular wire electrode was also inserted into the vastus lateralis to provide a concurrent reference for surface decomposition. Four repetitions of an isometric contraction task were collected.
- Subject 2 took part in two separate sessions. In the first session, two 3 × 3 grids were placed simultaneously over proximal and distal regions of the right tibialis anterior, yielding three recordings with 18 channels each. In the second session, a single 4 × 4 grid was placed over the right tibialis anterior, and three more recordings were collected.

Before we begin, the dataset sits in a flat folder structure as the acquisition software and experimenter left it:

```
my_dataset/
├── sub1/
│   ├── vl_trial1.otb+
│   ├── vl_trial2.otb+
│   ├── vl_trial3.otb+
│   └── vl_trial4.otb+
└── sub2/
    ├── ta_2grids_trial1.otb+
    ├── ta_2grids_trial2.otb+
    ├── ta_2grids_trial3.otb+
    ├── ta_1grid_trial1.otb+
    ├── ta_1grid_trial2.otb+
    └── ta_1grid_trial3.otb+
```

The goal is to turn this into a BIDS-formatted dataset!

---

### Why BIDS?

BIDS (Brain Imaging Data Structure) is a community standard for organising neuroscience data so that it is **FAIR** — Findable, Accessible, Interoperable, and Reusable. A BIDS-formatted dataset is self-describing: anyone who picks it up, regardless of which lab or software they use, can understand what was recorded, how it was recorded, and who the participants were, without having to contact the authors.

For HD-EMG specifically, this means every recording file is accompanied by a set of metadata files that describe the hardware, the electrode layout, the coordinate system, and the channel list. None of this lives in a separate Word document or lab notebook — it travels with the data.

#### Metadata lives at multiple levels

BIDS organises metadata in a hierarchy that mirrors the structure of a typical experiment:

- **Dataset level** — who made this, what license it carries, what kind of data it contains (`dataset_description.json`)
- **Participant level** — demographics for each subject (`participants.tsv`)
- **Recording level** — for each individual file: hardware settings, filters, channel list, electrode positions, coordinate system (`*_emg.json`, `*_channels.tsv`, `*_electrodes.tsv`, `*_coordsystem.json`)

This walkthrough focuses on the recording level, since that is where most of the complexity lives for HD-EMG datasets.

---

### The crux: electrodes, channels, and coordinate systems

An **electrode** is a physical object attached to the skin. A **channel** is the digitised signal that the acquisition software stores to disk — typically one channel per electrode, though referencing schemes mean the relationship is not always one-to-one. BIDS keeps these concepts separate because knowing where a channel was recorded is not the same as knowing what signal it carries.

The critical challenge for HD-EMG is linking physical sensor locations to recorded channels. EMG-BIDS solves this with two files that work together:

- `_electrodes.tsv` lists every electrode by name and gives its x, y, z position in some coordinate system.
- `_coordsystem.json` defines what that coordinate system is — where its origin sits, how its axes are oriented, and how it relates to anatomy (e.g., origin at the medial malleolus, x-axis pointing proximally along the tibia).

For HD-EMG grids it is rarely practical to measure every electrode position directly. Instead, the grid geometry is known (regular spacing, fixed layout), so you measure just one anchor electrode in the anatomical frame and derive all others from the grid's internal coordinate system. EMG-BIDS uses **one `_coordsystem.json` file per coordinate space**, distinguished by a `space-<label>` entity in the filename. An anatomical frame (`space-thigh_coordsystem.json`) describes the body-relative reference; a grid frame (`space-grid1_coordsystem.json`) describes electrode geometry relative to its own origin and — when an anchor measurement is available — references the parent anatomical frame with `ParentCoordinateSystem`, `AnchorElectrode`, and `AnchorCoordinates` fields. If no anatomical measurement was taken, the grid file stands alone with grid-internal coordinates only.

---

### Our approach: all metadata in five simple CSV files

Filling in BIDS metadata by hand — one JSON or TSV per recording — is error-prone and tedious for anything beyond a handful of files. We simplify this by collecting all the information in five CSV files, then generating the full set of BIDS metadata files automatically.

The five files and what they produce:

<div class="table-scroll table-sm" markdown="1">

| File you fill | What it describes | BIDS files generated |
|---------------|-------------------|----------------------|
| `participants.csv` | Subject demographics (age, sex, height, weight, group) | `participants.tsv` |
| `recordings.csv` | One row per recording: which subject, which session, which task, and which recording configuration was used | Internal index used to name and route all other output files |
| `setup.csv` | Hardware and acquisition settings for each recording configuration | `*_emg.json` (one per setup) |
| `coordsystems.csv` | Anatomical and grid coordinate systems for each setup | `*_coordsystem.json` (one per setup) |
| `channels_electrodes.csv` | Every channel and its corresponding electrode position | `*_channels.tsv` (one per recording) + `*_electrodes.tsv` (one per setup) |

</div>

**A note on `setup.csv`.** This file does not correspond directly to any single BIDS file! Instead, each *setup* is a named bundle of hardware settings and electrode configuration that can be shared across many recordings. The name appears as a column in `recordings.csv`, so each recording row simply declares which setup it belongs to. This is especially useful when different recordings in the same dataset use different grids (e.g., different muscles, different grid sizes), different amplifiers, or additional recording modalities such as concurrent intramuscular EMG. Without this abstraction you would need to re-specify the full hardware description for every recording individually.

In our example dataset, three setups arise naturally across the ten recordings.

> **Disclaimer.** This approach works well for typical HD-EMG experiments with a small number of well-defined recording configurations. It does not cover every possible EMG-BIDS feature, and some datasets — for example those with per-channel impedance measurements, intramuscular concurrent recordings, or complex multi-space electrode layouts — may require additional hand-editing of the generated files. At the end of the day, BIDS requires metadata at multiple levels and this needs to be at the back of the curator's mind when preparing a dataset.

---

### Part 1 — Dataset, participants and recordings

The dataset-level fields — name, authors, licence, BIDS version — are filled in via our [EMG-BIDS Metadata Tool](/metadata-form.md). For our tutorial dataset the resulting `dataset_description.json` looks like this:

```json
{
  "Name": "MUnitQuest Example Dataset",
  "BIDSVersion": "1.11.1",
  "DatasetType": "raw",
  "License": "CC0",
  "Authors": ["MUnitQuest"],
}
```

Next we fill in the participant-level and recording-level index files. Together these two CSVs define the subject IDs, session labels, and task names that BIDS will use to name every output file.

#### `participants.csv`

This file contains one row per subject. The `group` column is optional but useful for distinguishing experimental populations.

| participant_id | sex | age | height | weight | handedness | group |
|----------------|-----|-----|--------|--------|------------|-------|
| 01 | male | 25 | 178 | 75 | right | control |
| 02 | female | 30 | 157 | 62 | right | control |

#### `recordings.csv`

This file contains one row per recording file. The `setup` column links each recording to its hardware and electrode configuration. In our dataset, as we indicated before, three distinct setups appear: `VL_3x4s_1i`, `TA_dual_3x3`, and `TA_4x4`. Each will generate its own set of BIDS metadata files.

Subject 1 has only a single session, so `ses` field is left blank. Subject 2's three recordings from each session reference different setups because the grid configuration changed between sessions.

> **Note:** the keyword `ses` is also used to identify any change to the experimental setup of a single subject. E.g., if the electrodes were removed and repositioned, we would count this as a separate session, even though the setup remained identical.

| sub | ses | task_name | run | setup | path_to_emg_file | path_to_labels_file | path_to_events_file |
|-----|-----|-----------|-----|-------|------------------|---------------------|---------------------|
| 01 | | rest | 1 | VL_3x4s_1i | sub1/vl_trial1.npy | sub1/vl_trial1_mu.mat | |
| 01 | | isometric30percentMVC | 1 | VL_3x4s_1i | sub1/vl_trial2.npy | sub1/vl_trial2_mu.mat | sub1/vl_trial2_events.csv |
| 01 | | isometric50percentMVC | 1 | VL_3x4s_1i | sub1/vl_trial3.npy | sub1/vl_trial3_mu.mat | sub1/vl_trial3_events.csv |
| 01 | | isometric50percentMVC | 2 | VL_3x4s_1i | sub1/vl_trial4.npy | sub1/vl_trial4_mu.mat | sub1/vl_trial4_events.csv |
| 02 | 01 | rest | 1 | TA_dual_3x3 | sub2/ta_2grids_trial1.npy | sub2/ta_2grids_trial1_mu.mat | |
| 02 | 01 | isometric30percentMVC | 1 | TA_dual_3x3 | sub2/ta_2grids_trial2.npy | sub2/ta_2grids_trial2_mu.mat | sub2/ta_2grids_trial2_events.csv |
| 02 | 01 | isometric30percentMVC | 2 | TA_dual_3x3 | sub2/ta_2grids_trial3.npy | sub2/ta_2grids_trial3_mu.mat | sub2/ta_2grids_trial3_events.csv |
| 02 | 02 | isometric30percentMVC | 1 | TA_4x4 | sub2/ta_1grid_trial1.npy | sub2/ta_1grid_trial1_mu.mat | sub2/ta_1grid_trial1_events.csv |
| 02 | 02 | isometric30percentMVC | 2 | TA_4x4 | sub2/ta_1grid_trial2.npy | sub2/ta_1grid_trial2_mu.mat | sub2/ta_1grid_trial2_events.csv |
| 02 | 02 | isometric30percentMVC | 3 | TA_4x4 | sub2/ta_1grid_trial3.npy | sub2/ta_1grid_trial3_mu.mat | sub2/ta_1grid_trial3_events.csv |

Each row points to three data files that together constitute a complete recording: the raw HD-sEMG signal (`path_to_emg_file`), the decomposed spike trains after manual curation (`path_to_labels_file`), and the behavioural event annotations (`path_to_events_file`). These files do not come directly from your acquisition software — you need to export and convert them into the formats the assembly script expects before filling in the paths above.

> **Before filling in these paths**, convert your original acquisition files: `path_to_emg_file` should point to an array file (`.npy` / `.npz` for Python, `.mat` for MATLAB) with shape **n_channels × n_samples**; `path_to_labels_file` to your decomposed spike trains in the same format; and `path_to_events_file` to a behavioural events CSV. Rest recordings with no task structure can leave `path_to_events_file` blank. See [Part 4](#part-4----recorded-data-annotated-events-and-decomposed-spike-trains) for the expected file formats and events CSV column layout.

---

### Part 2 — Describing hardware setups

With the index files in place, we now describe the three recording configurations in `setup.csv`. Each row names a setup and bundles together the amplifier model, electrode model, acquisition settings, and a short description of the task. Any recording in `recordings.csv` that references a setup name will inherit all of these fields in its `_emg.json` sidecar. While the fields below are largely self-explanatory, please refer to the [EMG-BIDS Specifications](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electromyography.html#sidecar-json-_emgjson) for further information on the `_emg.json` file.

#### `setup.csv`

(1) Amplifier columns:

| setup_name | Manufacturer | ManufacturersModelName |
|------------|--------------|------------------------|
| VL_3x4s_1i | OTBioelettronica | Quattrocento |
| TA_dual_3x3 | OTBioelettronica | Quattrocento |
| TA_4x4 | OTBioelettronica | Quattrocento |

(2) Acquisition settings columns:

| setup_name | SamplingFrequency | PowerLineFrequency | RecordingType | SoftwareHighPassHz | SoftwareLowPassHz | HardwareHighPassHz | HardwareLowPassHz | EMGChannelCount | EMGReference | EMGPlacementScheme |
|------------|-------------------|--------------------|---------------|--------------------|-------------------|--------------------|-------------------|-----------------|--------------|---------------------|
| VL_3x4s_1i | 2048 | 50 | continuous | 10 | 900 | 10 | 900 | 13 | monopolar | measured |
| TA_dual_3x3 | 2048 | 50 | continuous | 10 | 900 | 10 | 900 | 18 | monopolar | measured |
| TA_4x4 | 2048 | 50 | continuous | 10 | 900 | 10 | 900 | 16 | monopolar | measured |

(3) Task description columns:

| setup_name | TaskDescription | Instructions |
|------------|-----------------|--------------|
| VL_3x4s_1i | Isometric knee extension at 90 deg of hip flexion and 60 deg of knee flexion. Concurrent HD-sEMG (3×4 grid) and intramuscular (single wire) recordings from the right vastus lateralis. Participants matched force profiles displayed on a screen. | Sit upright in the dynamometer chair. Keep your thigh flat on the seat and follow the force trace on the screen. |
| TA_dual_3x3 | Isometric dorsiflexion at fixed ankle angle (90 deg). Two simultaneous 3x3 grids over proximal and distal right tibialis anterior. Participants matched force profiles displayed on a screen. | Sit with your leg relaxed. Keep your ankle at 90 degrees and follow the force trace on the screen as accurately as you can. |
| TA_4x4 | Isometric dorsiflexion at fixed ankle angle (90 deg). Single 4x4 grid over right tibialis anterior. Participants matched force profiles displayed on a screen. | Sit with your leg relaxed. Keep your ankle at 90 degrees and follow the force trace on the screen as accurately as you can. |

> **Note:** The `EMGChannelCount` reflects all EMG-type channels: 13 for `VL_3x4s_1i` (12 surface + 1 intramuscular), 18 for the two simultaneous 3 × 3 grids, and 16 for the 4 × 4 grid. 

---

### Part 3 — Coordinate systems and electrode channel maps

Let's now turn to describing the three *setup* configurations. Each setup helps produce the `_emg.json`, `_channels.tsv`, `_electrodes.tsv`, and `_coordsystem.json` files *per recording*. We fill in `coordsystems.csv` and `channels_electrodes.csv` — one block of rows per setup. For more information on the fields we will fill below, refer to the [EMG-BIDS Specification](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electromyography.html#channels-description-_channelstsv).

#### Setup VL_3x4s_1i — sub-01's 3 × 4 surface grid + 1 intramuscular wire on right vastus lateralis

In this setup, the electrode grid was placed over the right vastus lateralis, located by palpating the quadriceps group and centering the grid over the muscle belly. A single intramuscular fine wire electrode (E_im) was inserted approximately midway across the grid, between E6 and E7. At the end of the recording session, a tape measure was used to locate electrode E1 — the top-left corner of the grid — relative to the greater trochanter: 55 mm lateral, 175 mm distal along the femoral shaft. This single measurement, the *anchor point*, is all we need for the surface electrodes: because the grid geometry is regular and known (3 × 4 layout, 8 mm spacing), the positions of every other surface electrode follow automatically. Correspondingly, this setup uses two coordinate systems: an anatomical one (`thigh`) that places the grid anchor point in the body frame, and a grid coordinate system (`grid1`) that specifies each electrode’s position relative to the grid’s own origin.

For the intramuscular wire, we reuse the `grid1` coordinate system. Its x and y coordinates give the skin insertion point in the grid frame (x=12, y=8 — between columns 2 and 3, second row), and z gives the insertion depth into the muscle (12 mm). 

> **What if you did not measure the anchor?** The EMG-BIDS spec allows omitting `ParentCoordinateSystem`, `AnchorElectrode`, and `AnchorCoordinates` from `_coordsystem.json`. Your `_electrodes.tsv` will still contain valid grid-internal coordinates (each electrode's position relative to E1), but they will not be tied to any anatomical frame — the positions describe electrode geometry relative to one another, not where on the body the grid sat. Note that if you *do* include a `ParentCoordinateSystem`, the spec then requires both `AnchorElectrode` and `AnchorCoordinates`.

*Grid layout:* single grid with 3 rows and 4 columns, 8 mm inter-electrode distance. Surface channels are labelled EMG001–EMG012 in row-major order; the intramuscular wire is EMG013. 

```
E1     E2     E3     E4      (y = 0 mm)
E5     E6     E7     E8      (y = 8 mm)
E9     E10    E11    E12     (y = 16 mm)
x=0    x=8    x=16   x=24
```

The intramuscular wire (E_im) was inserted between E6 and E7, approximately at x=12, y=8 in the grid frame, to a depth of 12 mm.

Correspondingly, our `coordsystems.csv` and `channels_electrodes.csv` rows look like this:

`coordsystems.csv`:

| setup | name | type | units | description | parent_coord_system | anchor_electrode | anchor_x | anchor_y |
|-------|------|------|-------|-------------|---------------------|------------------|----------|----------|
| VL_3x4s_1i | thigh | anatomical | mm | Origin at the greater trochanter. x-axis points distally along the femoral shaft. y-axis points anteriorly. z-axis points medially. | | | | |
| VL_3x4s_1i | grid1 | grid | mm | 3x4 grid over right vastus lateralis. Origin at electrode E1 (top-left corner). x-axis points distally, y-axis points laterally. For intramuscular entries, z represents insertion depth positive into the muscle. | thigh | E1 | 55 | 175 |

`channels_electrodes.csv`:

| setup | channel_name | type | units | electrode_name | x | y | z | coordinate_system | reference | group | target_muscle | material | ElectrodeManufacturer | ElectrodeManufacturersModelName | impedance | low_cutoff | high_cutoff |
|-------|--------------|------|-------|----------------|---|---|---|-------------------|-----------|-------|---------------|----------|-----------------------|--------------------------------|-----------|------------|-------------|
| VL_3x4s_1i | EMG001 | EMG | uV | E1 | 0 | 0 | 0 | grid1 | R1 | grid1 | right vastus lateralis | Ag/AgCl | OTBioelettronica | HD08MM0304 | n/a | 10 | 900 |
| VL_3x4s_1i | … | EMG | uV | … | … | … | 0 | grid1 | R1 | grid1 | right vastus lateralis | Ag/AgCl | OTBioelettronica | HD08MM0304 | n/a | 10 | 900 |
| VL_3x4s_1i | EMG012 | EMG | uV | E12 | 24 | 16 | 0 | grid1 | R1 | grid1 | right vastus lateralis | Ag/AgCl | OTBioelettronica | HD08MM0304 | n/a | 10 | 900 |
| VL_3x4s_1i | EMG013 | EMG | uV | E_im | 12 | 8 | 12 | grid1 | R1 | intramuscular | right vastus lateralis | stainless steel | OTBioelettronica | Fi-Wi2 | n/a | 10 | 900 |
| VL_3x4s_1i | Torque | MISC | Nm | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| VL_3x4s_1i | R1 | REF | n/a | R1 | 370 | 0 | 0 | thigh | n/a | n/a | n/a | Ag/AgCl | OTBioelettronica | n/a | n/a | n/a | n/a |

<p class="wt-table-note">EMG002–EMG011 follow the same pattern as EMG001: x cycles through 0, 8, 16, 24 mm across each column, y increments by 8 mm per row, z=0. EMG013 is the only channel with a non-zero z value.</p>

> **Note:** the grid layout above shows physical electrode labels (E1, E2, …, E_im) — the actual objects attached to or inserted into the tissue. The `channels_electrodes.csv` file specifies how each physical electrode maps to a stored data channel on disk: E1 → EMG001, …, E12 → EMG012, E_im → EMG013. Surface electrodes all sit at z=0 in the grid frame while the intramuscular wire is at z=12 (12 mm insertion depth). The reference electrode R1 is placed on the patella; its position (370, 0, 0) is expressed in the `thigh` anatomical frame (370 mm distal from the greater trochanter along the femoral shaft).

> **Intramuscular EMG — simplified treatment and ongoing spec work.** The approach above (reusing the surface grid coordinate system, encoding insertion depth as z) works for a single concurrent wire electrode but is a deliberate simplification. Datasets with intramuscular grids, fine wires, or concentric needles involve dedicated coordinate systems, additional physical parameters (wire diameter, tip length, cannula dimensions), and richer electrode type vocabulary that go beyond what this walkthrough covers. Critically, **the EMG-BIDS specification for invasive EMG is still under active development** — see [this open pull request](https://github.com/neuromechanist/bids-examples/pull/5) for the current state of the discussion. For a more complete worked example covering thin-film HD-iEMG grids, fine wires, and concentric needles alongside surface grids, see the [MUnitQuest fictional dataset tutorial](https://github.com/MUnitQuest/MUnitQuest_tutorials/blob/main/fictionalDatasetExample_to_bids.ipynb).

---

#### Setup TA_dual_3x3 — sub-02 session 1, two simultaneous 3 × 3 grids on right tibialis anterior

Here, both grids are on the same muscle — one placed over the proximal region, one over the distal region — recorded simultaneously into a single file per trial. Because both grids are on the same body segment, they share one anatomical coordinate system (`lowerLeg`) but each gets its own grid coordinate system (`grid1`, `grid2`), anchored to a different reference electrode.

Grid 1 (proximal TA), channels EMG001–EMG009, anchored to E1:

```
E1    E2    E3     (y = 0 mm)
E4    E5    E6     (y = 8 mm)
E7    E8    E9     (y = 16 mm)
x=0   x=8   x=16
```

Grid 2 (distal TA), channels EMG010–EMG018, anchored to E10:

```
E10   E11   E12    (y = 0 mm)
E13   E14   E15    (y = 8 mm)
E16   E17   E18    (y = 16 mm)
x=0   x=8   x=16
```

`coordsystems.csv`:

| setup | name | type | units | description | parent_coord_system | anchor_electrode | anchor_x | anchor_y |
|-------|------|------|-------|-------------|---------------------|------------------|----------|----------|
| TA_dual_3x3 | lowerLeg | anatomical | mm | Origin at the medial malleolus. x-axis points proximally along the tibial shaft. y-axis points laterally. z-axis points anteriorly. | | | | |
| TA_dual_3x3 | grid1 | grid | mm | 3x3 grid over proximal right tibialis anterior. Origin at electrode E1. | lowerLeg | E1 | 25 | 240 |
| TA_dual_3x3 | grid2 | grid | mm | 3x3 grid over distal right tibialis anterior. Origin at electrode E10. | lowerLeg | E10 | 25 | 150 |

`channels_electrodes.csv`:

| setup | channel_name | type | units | electrode_name | x | y | z | coordinate_system | reference | group | target_muscle | material | impedance | low_cutoff | high_cutoff |
|-------|--------------|------|-------|----------------|---|---|---|-------------------|-----------|-------|---------------|----------|-----------|------------|-------------|
| TA_dual_3x3 | EMG001 | EMG | uV | E1 | 0 | 0 | 0 | grid1 | R1 | grid1 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_dual_3x3 | EMG002 | EMG | uV | E2 | 8 | 0 | 0 | grid1 | R1 | grid1 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_dual_3x3 | … | EMG | uV | … | … | … | 0 | grid1 | R1 | grid1 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_dual_3x3 | EMG009 | EMG | uV | E9 | 16 | 16 | 0 | grid1 | R1 | grid1 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_dual_3x3 | EMG010 | EMG | uV | E10 | 0 | 0 | 0 | grid2 | R2 | grid2 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_dual_3x3 | EMG011 | EMG | uV | E11 | 8 | 0 | 0 | grid2 | R2 | grid2 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_dual_3x3 | … | EMG | uV | … | … | … | 0 | grid2 | R2 | grid2 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_dual_3x3 | EMG018 | EMG | uV | E18 | 16 | 16 | 0 | grid2 | R2 | grid2 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_dual_3x3 | Torque | MISC | Nm | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| TA_dual_3x3 | R1 | REF | n/a | R1 | 0 | 0 | 0 | lowerLeg | n/a | n/a | n/a | Ag/AgCl | n/a | n/a | n/a |
| TA_dual_3x3 | R2 | REF | n/a | R2 | 0 | 0 | 0 | lowerLeg | n/a | n/a | n/a | Ag/AgCl | n/a | n/a | n/a |

<p class="wt-table-note">EMG001–EMG009 are in <code>grid1</code>, EMG010–EMG018 in <code>grid2</code>. Each grid resets to x=0, y=0 at its own origin — grid2 coordinates are not a continuation of grid1's.</p>

---

#### Setup TA_4x4 — sub-02 session 2, single 4 × 4 grid on right tibialis anterior

Finally, in this setup, we use a single grid with 4 rows and 4 columns, 8 mm inter-electrode distance. Channels EMG001–EMG016 in row-major order. The electrode position relative to anatomical landmarks was not recorded, so the grid coordinate system has no parent anchor — the grid-internal positions describe electrode geometry relative to E1 but are not tied to a body landmark. We still include a `lowerLeg` anatomical frame so the reference electrode R1 (at the ankle, 0, 0, 0) has a valid coordinate system.

Grid layout — electrode labels:

```
E1     E2     E3     E4      (y = 0 mm)
E5     E6     E7     E8      (y = 8 mm)
E9     E10    E11    E12     (y = 16 mm)
E13    E14    E15    E16     (y = 24 mm)
x=0    x=8    x=16   x=24
```

`coordsystems.csv`:

| setup | name | type | units | description | parent_coord_system | anchor_electrode | anchor_x | anchor_y |
|-------|------|------|-------|-------------|---------------------|------------------|----------|----------|
| TA_4x4 | lowerLeg | anatomical | mm | Origin at the medial malleolus. x-axis points proximally along the tibial shaft. y-axis points laterally. z-axis points anteriorly. | | | | |
| TA_4x4 | grid1 | grid | mm | 4x4 grid over right tibialis anterior. Origin at electrode E1 (top-left corner). x-axis points distally, y-axis points laterally. No anatomical landmark measures available. | | | | |

`channels_electrodes.csv`:

| setup | channel_name | type | units | electrode_name | x | y | z | coordinate_system | reference | group | target_muscle | material | impedance | low_cutoff | high_cutoff |
|-------|--------------|------|-------|----------------|---|---|---|-------------------|-----------|-------|---------------|----------|-----------|------------|-------------|
| TA_4x4 | EMG001 | EMG | uV | E1 | 0 | 0 | 0 | grid1 | R1 | grid1 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_4x4 | EMG002 | EMG | uV | E2 | 8 | 0 | 0 | grid1 | R1 | grid1 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_4x4 | … | EMG | uV | … | … | … | 0 | grid1 | R1 | grid1 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_4x4 | EMG016 | EMG | uV | E16 | 24 | 24 | 0 | grid1 | R1 | grid1 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_4x4 | Torque | MISC | Nm | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| TA_4x4 | R1 | REF | n/a | R1 | 0 | 0 | 0 | lowerLeg | n/a | n/a | n/a | Ag/AgCl | n/a | n/a | n/a |

<p class="wt-table-note">EMG003–EMG015 follow the same pattern as VL_3x4 above: x cycles 0 → 8 → 16 → 24 mm across columns, y increments by 8 mm per row.</p>

---

### Generating EMG-BIDS Metadata

With all five CSV files prepared, head to the [MUnitQuest EMG-BIDS Metadata Tool](/metadata-form). The last step of the form asks you to upload your CSVs and fill in a few dataset-level fields (dataset name, authors, licence, institution). Click **Generate & Download** and the tool will produce a `metadata.zip` containing the full set of BIDS sidecar files — one `_emg.json`, `_channels.tsv`, `_electrodes.tsv`, and `_coordsystem.json` per recording, plus `dataset_description.json`, `participants.tsv`, and `participants.json` at the dataset root.

We will use the generated `metadata.zip` file and insert the data files where necessary as shown next.

### Part 4 — Recorded data, annotated events and decomposed spike trains

Each recording must be accompanied by three types of data files:

- **The recording itself** — the raw HD-sEMG or iEMG signals, kinematics or force measurements etc. in `.edf` or `.bdf` format.
- **Behavioural event annotations** — a `_events.tsv` file (and a shared `_events.json` sidecar) that annotate what behaviour was performed.
- **Decomposed spike trains** — one `_events.tsv` per recording, placed under `derivatives/`, listing the discharge times of each identified motor unit after decomposition and manual curation.

All three must be present for every recording before the dataset can be submitted.

---

#### Recorded HD-sEMG Signals

EMG-BIDS requires our recording files to be in **EDF (European Data Format) or BDF (Biosemi Data Format)** . Here, we assume that your original acquisition files (`.otb+` or similar) have been exported to language-native arrays: `.npy` / `.npz` for Python, `.mat` for MATLAB, each with shape **n_channels × n_samples** (Python) or **n_samples × n_channels** (MATLAB).

The helpers below convert a single recording array to EDF. `get_channel_names` reads `channels_electrodes.csv` to return the ordered list of channel labels for a given setup; `write_edf` writes them to disk. Part 5 calls these inside the full assembly loop.

<div class="code-tabs">
<div class="tab-pane" data-label="Python">
<pre><code class="language-python">import numpy as np
import pandas as pd
import pyedflib
from pathlib import Path

def get_channel_names(channels_csv, setup):
    """Return ordered channel names for a given setup from channels_electrodes.csv.

    Excludes REF electrodes (those with channel_name == "n/a").
    """
    ch = pd.read_csv(channels_csv, keep_default_na=False, na_values=[""])
    mask = (ch["setup"] == setup) & ch["channel_name"].notna() & (ch["channel_name"].str.strip() != "n/a")
    return ch.loc[mask, "channel_name"].str.strip().tolist()


def write_edf(out_path, data, channel_names, fs):
    """Write data to EDF. data: np.ndarray, shape (n_channels, n_samples)."""
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with pyedflib.EdfWriter(str(out_path), len(channel_names)) as f:
        headers = [
            {
                "label":            ch,
                "sample_frequency": fs,
            }
            for i, ch in enumerate(channel_names)
        ]
        f.setSignalHeaders(headers)
        f.writeSamples(data)</code></pre>
</div>
<div class="tab-pane" data-label="MATLAB">
<pre><code class="language-matlab">% Requires R2020b+ for edfwrite.

function channelNames = getChannelNames(channelsCsv, setupName)
    % Return ordered channel names for a given setup from channels_electrodes.csv.
    t = readtable(channelsCsv, "TextType", "string");
    rows = t(t.setup == setupName, :);
    channelNames = cellstr(rows.channel_name);
end


function writeEdf(outPath, data, channelNames, fs)
    % data: [n_samples x n_channels]
    outDir = fileparts(outPath);
    if ~isfolder(outDir), mkdir(outDir); end
    tt = array2timetable(data, "SampleRate", fs, "VariableNames", channelNames);
    edfwrite(outPath, tt);
end</code></pre>
</div>
</div>

---

#### Annotated behavioural events

Each recording that involves a task protocol should be accompanied by a `_events.tsv` file that marks the onset and duration of each phase of the trial. This gives context to the EMG signal, such that one could extract e.g. the hold phase of an isometric ramp-and-hold contraction to decompose. 

An example for a standard ramp–hold–ramp isometric protocol at 30% MVC (sampling rate 2048 Hz) maybe annotated as:

`sub-01_ses-01_task-isometric30percentMVC_run-01_events.tsv`:

| onset | duration | sample | mvc_level | event_type | description |
|-------|----------|--------|-----------|------------|-------------|
| 5.0 | 0.0 | 10240 | n/a | muscle_on | Start of voluntary contraction |
| 5.0 | 10.0 | 10240 | 0.0 | linear_ramp | Ramp up to 30% MVC at 6% MVC/s |
| 10.0 | 30.0 | 20480 | 30.0 | steady_hold | Steady isometric contraction at 30% MVC |
| 30.0 | 5.0 | 61440 | 30.0 | linear_ramp | Ramp down from 30% MVC at –6% MVC/s |
| 35.0 | 0.0 | 71680 | 0.0 | muscle_off | End of voluntary contraction |

`onset` and `duration` are always in seconds. `sample` is the corresponding integer sample index (onset × fs). For rest recordings with no task structure, omit the events file entirely.

> **Important:** For submissions to MUnitQuest, we require that the "muscle_on" and "muscle_off" events be always annotated such that we can easily separate signal portions from rest. Any other annotations, e.g., mvc_level, descriptions of task phases etc. are welcome!

Given our dataset contains only simple isometric tasks, we have included the following dataset-level `_events.json` sidecar that describes the how we annotate the task in the `_events.tsv` file above. By placing this at the top-level directory, it is inherited by all recordings!

`events.json`:
```json
{
  "onset": {
    "Description": "Event onset in seconds from the start of the recording.",
    "Units": "s"
  },
  "duration": {
    "Description": "Duration of the event in seconds. 0 for instantaneous events.",
    "Units": "s"
  },
  "sample": {
    "Description": "Sample index corresponding to the event onset.",
    "Units": "samples"
  },
  "mvc_level": {
    "Description": "Target force level at the start of the event, as a percentage of maximum voluntary contraction. n/a for non-force events.",
    "Units": "%MVC"
  },
  "event_type": {
    "Description": "Category of the event.",
    "Levels": {
      "muscle_on":   "Onset of voluntary muscle activation.",
      "muscle_off":  "End of voluntary muscle activation.",
      "linear_ramp": "Linear force ramp between two target levels.",
      "steady_hold": "Steady isometric contraction at a fixed target level."
    }
  },
  "description": {
    "Description": "Human-readable description of the event."
  }
}
```

---

#### Spike-train event files

Finally, motor-unit decomposition results are stored as BIDS events files under a `derivatives/` subfolder. Each spike train becomes a set of rows with `onset` (seconds from recording start), `duration` (0) etc. and all spike trains for a given recording are combined into an events file, such as:

`sub-01_ses-01_task-isometric30percentMVC_run-01_desc-decomposition_events.tsv`:

| onset | duration | sample | unit_id | description |
| ----- | -------- | ------ | ------- | ----------- |
| 0.001 | 0 | 1 | 0 | motor-unit-spike |
| 0.005 | 0 | 5 | 1 | motor-unit-spike |
| 0.011 | 0 | 11 | 0 | motor-unit-spike |
| 0.012 | 0 | 12 | 2 | motor-unit-spike |
| 0.016 | 0 | 16 | 1 | motor-unit-spike |
| ... | ... | ... | ... | ... |

Which can easily produced by the following code, given you have arranged the decomposed spike trains into a `dict` or `cellArray`.

<div class="code-tabs">
<div class="tab-pane" data-label="Python">
<pre><code class="language-python">def write_events_tsv(out_path: Path, spike_trains: dict, fs: float) -> None:
    """Write BIDS events.tsv from a dict of {mu_label: sample_index_array}."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    rows = []
    for mu_label in sorted(spike_trains.keys()):
        for sample in spike_trains[mu_label]:
            rows.append({"onset": round(float(sample) / fs, 6), "duration": 0.0, "trial_type": mu_label})
    df = pd.DataFrame(rows, columns=["onset", "duration", "trial_type"])
    df.sort_values("onset").reset_index(drop=True).to_csv(out_path, sep="\t", index=False)</code></pre>
</div>
<div class="tab-pane" data-label="MATLAB">
<pre><code class="language-matlab">function writeEventsTsv(outPath, spikeTrains, fs)
    % outPath    -- full path to the output _events.tsv file
    % spikeTrains -- containers.Map: mu_label -> sample index array
    % fs         -- sampling frequency in Hz
    outDir = fileparts(outPath);
    if ~isempty(outDir) && ~isfolder(outDir), mkdir(outDir); end

    muLabels = sort(keys(spikeTrains));
    onset = []; duration = []; trialType = {};
    for i = 1:numel(muLabels)
        label   = muLabels{i};
        samples = spikeTrains(label);
        for s = samples(:)'
            onset(end+1,1)     = round(double(s) / fs, 6); %#ok
            duration(end+1,1)  = 0; %#ok
            trialType{end+1,1} = label; %#ok
        end
    end

    t = table(onset, duration, trialType, 'VariableNames', {'onset','duration','trial_type'});
    t = sortrows(t, 'onset');
    writetable(t, outPath, 'Delimiter', '\t', 'FileType', 'text');
end</code></pre>
</div>
</div>

The pipeline folder also needs its own `dataset_description.json` with `"DatasetType": "derivative"`. And a `.bidsignore` file at the dataset root (containing `derivatives/`) tells the BIDS validator to skip the derivatives subtree when validating the raw dataset.

---

### Part 5 — Assembling the dataset

With the five CSVs filled in, `metadata.zip` downloaded from the MUnitQuest tool, and your recordings and events files ready, you can assemble the full BIDS folder in one call:

1. Unpack `metadata.zip` into the output folder (all sidecar JSON files land in the right places)
2. For each recording: write the EDF, copy the behavioural events TSV, and write spike-train events into `derivatives/`
3. Write `derivatives/dataset_description.json` (required by the BIDS validator)

<div class="code-tabs">
<div class="tab-pane" data-label="Python">
<pre><code class="language-python">import json
import numpy as np
import pandas as pd
import zipfile
from pathlib import Path


PIPELINE_NAME = "motor-unit-decomposition"


def assemble_bids_dataset(recordings_csv, channels_csv, metadata_zip,
                           data_dir, output_dir, fs):
    """
    Build a BIDS dataset folder.

    recordings_csv -- path to your filled-in recordings.csv
    channels_csv   -- path to your filled-in channels_electrodes.csv
    metadata_zip   -- path to metadata.zip downloaded from the MUnitQuest tool
    data_dir       -- root folder; path_to_* values in recordings.csv are relative to this
    output_dir     -- destination folder (created if needed)
    fs             -- sampling frequency in Hz
    """
    output_dir = Path(output_dir)

    # 1. Unpack BIDS sidecar files
    with zipfile.ZipFile(metadata_zip) as zf:
        zf.extractall(output_dir)

    recs = pd.read_csv(recordings_csv, dtype=str).fillna("")
    has_derivatives = False

    for _, row in recs.iterrows():
        sub   = f"sub-{int(row['sub']):02d}"
        ses   = row.get("ses", "").strip()
        task  = row["task_name"].strip()
        run   = row.get("run", "").strip()
        setup = row["setup"].strip()

        parts = [sub]
        if ses:  parts.append(f"ses-{int(ses):02d}")
        parts.append(f"task-{task}")
        if run:  parts.append(f"run-{int(run):02d}")
        bids_stem  = "_".join(parts)
        ses_folder = f"ses-{int(ses):02d}" if ses else ""
        subdir     = output_dir / sub / ses_folder

        # 2a. Write EDF
        src  = Path(data_dir) / row["path_to_emg_file"].strip()
        data = np.load(src)["data"] if src.suffix == ".npz" else np.load(src)
        channel_names = get_channel_names(channels_csv, setup)
        write_edf(subdir / "emg" / (bids_stem + "_emg.edf"),
                  data.astype(np.float32), channel_names, fs)

        # 2b. Write behavioural events TSV
        events_rel = row.get("path_to_events_file", "").strip()
        if events_rel:
            evts = pd.read_csv(Path(data_dir) / events_rel)
            out  = subdir / "emg" / (bids_stem + "_events.tsv")
            out.parent.mkdir(parents=True, exist_ok=True)
            evts.to_csv(out, sep="\t", index=False)

        # 2c. Write spike-train events to derivatives/
        labels_rel = row.get("path_to_labels_file", "").strip()
        if labels_rel:
            deriv_dir = output_dir / "derivatives" / PIPELINE_NAME / sub / ses_folder
            npz = np.load(Path(data_dir) / labels_rel)
            write_events_tsv(
                deriv_dir / "emg" / (bids_stem + "_desc-decomposition_events.tsv"),
                {k: npz[k] for k in npz.files},
                fs,
            )
            has_derivatives = True

    # 3. Write derivatives/dataset_description.json
    if has_derivatives:
        deriv_root = output_dir / "derivatives" / PIPELINE_NAME
        deriv_root.mkdir(parents=True, exist_ok=True)
        (deriv_root / "dataset_description.json").write_text(json.dumps({
            "Name": PIPELINE_NAME, "BIDSVersion": "1.11.1",
            "DatasetType": "derivative",
            "GeneratedBy": [{"Name": PIPELINE_NAME}],
        }, indent=2))

    (output_dir / ".bidsignore").write_text("derivatives/\n")
    print(f"\nDone. BIDS dataset at: {output_dir}")


# --- Run ---
assemble_bids_dataset(
    recordings_csv = "recordings.csv",
    channels_csv   = "channels_electrodes.csv",
    metadata_zip   = "metadata.zip",
    data_dir       = "my_dataset/",
    output_dir     = "bids_dataset/",
    fs             = 2048,
)</code></pre>
</div>
<div class="tab-pane" data-label="MATLAB">
<pre><code class="language-matlab">% Requires R2020b+ for edfwrite, R2021a+ for jsonencode PrettyPrint.

function assembleBidsDataset(recordingsCsv, channelsCsv, metadataZip, ...
                              dataDir, outputDir, fs)
    pipelineName = "motor-unit-decomposition";

    % 1. Unpack BIDS sidecar files
    unzip(metadataZip, outputDir);

    recs = readtable(recordingsCsv, "TextType", "string");
    hasDerivatives = false;

    for i = 1:height(recs)
        row   = recs(i, :);
        sub   = sprintf("sub-%02d", str2double(row.sub{1}));
        ses   = strtrim(row.ses{1});   hasSes = ~ismissing(ses) && ses ~= "";
        task  = strtrim(row.task_name{1});
        run   = strtrim(row.run{1});   hasRun = ~ismissing(run) && run ~= "";
        setup = strtrim(row.setup{1});

        sesPart = ""; runPart = "";
        if hasSes, sesPart = sprintf("ses-%02d_", str2double(ses)); end
        if hasRun, runPart = sprintf("_run-%02d", str2double(run)); end
        bidsStem = sprintf("%s_%stask-%s%s", sub, sesPart, task, runPart);

        if hasSes
            subdir = fullfile(outputDir, sub, sprintf("ses-%02d", str2double(ses)));
        else
            subdir = fullfile(outputDir, sub);
        end

        % 2a. Write EDF
        % .mat file must contain one variable of shape [n_samples x n_channels]
        loaded = load(fullfile(dataDir, row.path_to_emg_file{1}));
        data   = loaded.(fieldnames(loaded){1});
        channelNames = getChannelNames(channelsCsv, setup);
        writeEdf(fullfile(subdir, "emg", bidsStem + "_emg.edf"), data, channelNames, fs);

        % 2b. Write behavioural events TSV
        if ismember("path_to_events_file", recs.Properties.VariableNames)
            eventsRel = strtrim(row.path_to_events_file{1});
            if ~ismissing(eventsRel) && eventsRel ~= ""
                evts     = readtable(fullfile(dataDir, eventsRel), "TextType", "string");
                eventsOut = fullfile(subdir, "emg", bidsStem + "_events.tsv");
                if ~isfolder(fileparts(eventsOut)), mkdir(fileparts(eventsOut)); end
                writetable(evts, eventsOut, "Delimiter", "\t", "FileType", "text");
            end
        end

        % 2c. Write spike-train events to derivatives/
        if ismember("path_to_labels_file", recs.Properties.VariableNames)
            labelsRel = strtrim(row.path_to_labels_file{1});
            if ~ismissing(labelsRel) && labelsRel ~= ""
                % .mat file must contain one struct field per MU (MU_00, MU_01, ...)
                % each field is a numeric vector of spike sample indices
                spikes = load(fullfile(dataDir, labelsRel));
                muFields = fieldnames(spikes);
                spikeMap = containers.Map(muFields, ...
                    cellfun(@(f) spikes.(f), muFields, "UniformOutput", false));
                if hasSes
                    derivSubdir = fullfile(outputDir, "derivatives", pipelineName, sub, ...
                                           sprintf("ses-%02d", str2double(ses)));
                else
                    derivSubdir = fullfile(outputDir, "derivatives", pipelineName, sub);
                end
                writeEventsTsv(fullfile(derivSubdir, "emg", ...
                    bidsStem + "_desc-decomposition_events.tsv"), spikeMap, fs);
                hasDerivatives = true;
            end
        end
    end

    % 3. Write derivatives/dataset_description.json
    if hasDerivatives
        derivRoot = fullfile(outputDir, "derivatives", pipelineName);
        if ~isfolder(derivRoot), mkdir(derivRoot); end
        desc = struct("Name", pipelineName, "BIDSVersion", "1.11.1", ...
                      "DatasetType", "derivative", ...
                      "GeneratedBy", {{struct("Name", pipelineName)}});
        fid = fopen(fullfile(derivRoot, "dataset_description.json"), "w");
        fprintf(fid, "%s", jsonencode(desc, "PrettyPrint", true));
        fclose(fid);
    end

    fid = fopen(fullfile(outputDir, ".bidsignore"), "w");
    fprintf(fid, "derivatives/\n");
    fclose(fid);
    fprintf("\nDone. BIDS dataset at: %s\n", outputDir);
end


% --- Run ---
assembleBidsDataset( ...
    "recordings.csv", ...
    "channels_electrodes.csv", ...
    "metadata.zip", ...
    "my_dataset/", ...
    "bids_dataset/", ...
    2048 ...
);</code></pre>
</div>
</div>

---

### Conclusion

Running the assembly script with the five CSVs, `metadata.zip`, and source data files produces the following BIDS layout:

```
dataset/
├── .bidsignore
├── dataset_description.json
├── participants.tsv
├── participants.json
│
├── sub-01/
│   └── emg/
│       ├── sub-01_electrodes.tsv
│       ├── sub-01_space-thigh_coordsystem.json
│       ├── sub-01_space-grid1_coordsystem.json
│       ├── sub-01_task-rest_run-01_emg.edf
│       ├── sub-01_task-rest_run-01_emg.json
│       ├── sub-01_task-rest_run-01_channels.tsv
│       ├── sub-01_task-isometric30percentMVC_run-01_emg.edf
│       ├── sub-01_task-isometric30percentMVC_run-01_emg.json
│       ├── sub-01_task-isometric30percentMVC_run-01_channels.tsv
│       ├── sub-01_task-isometric30percentMVC_run-01_events.tsv
│       └── ...  (isometric50percentMVC runs follow the same pattern)
│
├── sub-02/
│   ├── ses-01/
│   │   └── emg/
│   │       ├── sub-02_ses-01_electrodes.tsv
│   │       ├── sub-02_ses-01_space-lowerLeg_coordsystem.json
│   │       ├── sub-02_ses-01_space-grid1_coordsystem.json
│   │       ├── sub-02_ses-01_space-grid2_coordsystem.json
│   │       ├── sub-02_ses-01_task-rest_run-01_emg.edf
│   │       ├── sub-02_ses-01_task-rest_run-01_emg.json
│   │       ├── sub-02_ses-01_task-rest_run-01_channels.tsv
│   │       └── ...  (isometric runs with _emg.edf, _emg.json, _channels.tsv, _events.tsv)
│   └── ses-02/
│       └── emg/
│           ├── sub-02_ses-02_electrodes.tsv
│           ├── sub-02_ses-02_space-grid1_coordsystem.json
│           └── ...  (isometric runs with _emg.edf, _emg.json, _channels.tsv, _events.tsv)
│
└── derivatives/
    └── motor-unit-decomposition/
        ├── dataset_description.json
        ├── sub-01/
        │   └── emg/
        │       ├── sub-01_task-rest_run-01_desc-decomposition_events.tsv
        │       ├── sub-01_task-isometric30percentMVC_run-01_desc-decomposition_events.tsv
        │       └── ...
        └── sub-02/
            ├── ses-01/emg/  (one _desc-decomposition_events.tsv per recording)
            └── ses-02/emg/  (one _desc-decomposition_events.tsv per recording)
```

Each recording has its own `_emg.json`, `_channels.tsv`, and — for task recordings — an `_events.tsv` with the behavioural annotations. The `_electrodes.tsv` and `_coordsystem.json` files are **shared** across recordings within a session and placed at the session (or subject) level. Decomposed spike trains live under `derivatives/motor-unit-decomposition/`, mirroring the same subject/session folder structure.

With all of this in place you have a fully BIDS-compliant HD-EMG dataset: self-describing, shareable, and ready for submission to MUnitQuest or any BIDS-compatible tool or repository!

<span style="font-size: 2rem;">🥳</span>

---

**Author:** Pranav Mamidanna  
**Reviewed by:** Thomas Klotz; Robin Rohlen  
**Feedback:** Found something unclear? [Open an issue on GitHub](https://github.com/MUnitQuest/MUnitQuest_tutorials/issues) — contributions are very welcome.