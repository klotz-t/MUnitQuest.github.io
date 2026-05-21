---
title: "MUnitQuest EMG-BIDS Tutorial"
feature_image: "/Images/header.jpeg"
layout: page
---


### Getting Started

This tutorial walks you through preparing a real HD-EMG dataset for sharing using the [EMG-BIDS](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electromyography.html) standard. By the end, you will have a complete set of BIDS-compliant metadata files ready to accompany your recordings.

The process has two stages: first, you fill in five simple CSV files that capture everything BIDS needs to know about your participants, recordings, hardware, electrode layout, and coordinate systems. Second, you upload those CSVs into the MUnitQuest metadata tool — along with a short online form for dataset-level details — and download a ZIP containing all the generated metadata files.

No programming is required. The CSVs are plain spreadsheets; the tool runs entirely in your browser.

#### Prerequisites

- A version of the dataset you would like to share or archive
- Some familiarity with MATLAB or Python
- Some familiarity with how your EMG acquisition device stores data

#### Example dataset

We will walk through preparing a dataset with 2 subjects and 10 recordings in total, where
- Subject 1 took part in a single experimental session, during which we recorded HD-EMG signals from the right vastus lateralis using a 3 × 4 electrode grid. Four repetitions of an isometric contraction task were collected.
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

For HD-EMG grids it is rarely practical to measure every electrode position directly. Instead, the grid geometry is known (regular spacing, fixed layout), so you measure just one anchor electrode in the anatomical frame and derive all others from the grid's internal coordinate system. `_coordsystem.json` records both the anatomical frame and the grid's child frame, with the anchor point linking the two.

---

### Our approach: all metadata in five simple CSV files

Filling in BIDS metadata by hand — one JSON or TSV per recording — is error-prone and tedious for anything beyond a handful of files. We simplify this by collecting all the information in five CSV files, then generating the full set of BIDS metadata files automatically.

The five files and what they produce:

| File you fill | What it describes | BIDS files generated |
|---------------|-------------------|----------------------|
| `participants.csv` | Subject demographics (age, sex, height, weight, group) | `participants.tsv` |
| `recordings.csv` | One row per recording: which subject, which session, which task, and which recording configuration was used | Internal index used to name and route all other output files |
| `setup.csv` | Hardware and acquisition settings for each recording configuration | `*_emg.json` (one per setup) |
| `coordsystems.csv` | Anatomical and grid coordinate systems for each setup | `*_coordsystem.json` (one per setup) |
| `channels_electrodes.csv` | Every channel and its corresponding electrode position | `*_channels.tsv` + `*_electrodes.tsv` (one pair per setup) |

**A note on `setup.csv`.** This file does not correspond directly to any single BIDS file! Instead, each *setup* is a named bundle of hardware settings and electrode configuration that can be shared across many recordings. The name appears as a column in `recordings.csv`, so each recording row simply declares which setup it belongs to. This is especially useful when different recordings in the same dataset use different grids (e.g., different muscles, different grid sizes), different amplifiers, or additional recording modalities such as concurrent intramuscular EMG. Without this abstraction you would need to re-specify the full hardware description for every recording individually.

In our example dataset, three setups arise naturally across the ten recordings.

> **Disclaimer.** This approach works well for typical HD-EMG experiments with a small number of well-defined recording configurations. It does not cover every possible EMG-BIDS feature, and some datasets — for example those with per-channel impedance measurements, intramuscular concurrent recordings, or complex multi-space electrode layouts — may require additional hand-editing of the generated files. At the end of the day, BIDS requires metadata at multiple levels and this needs to be at the back of the curator's mind when preparing a dataset.

---

### Part 1 — Dataset, participants and recordings

The dataset-level fields — name, authors, licence, BIDS version — are filled in via the online form. For our tutorial dataset the resulting `dataset_description.json` looks like this:

```json
{
  "Name": "EMG-BIDS MUnitQuest tutorial dataset",
  "BIDSVersion": "1.11.0",
  "License": "CC0",
  "Authors": ["MUnitQuest Team"],
  "DatasetType": "raw"
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

This file contains one row per recording file. The `setup` column links each recording to its hardware and electrode configuration. In our dataset, as we indicated before, three distinct setups appear: `VL_3x4`, `TA_dual_3x3`, and `TA_4x4`. Each will generate its own set of BIDS metadata files.

Subject 1 has only a single session, so `ses` field is left blank. Subject 2's three recordings from each session reference different setups because the grid configuration changed between sessions.

> **Note:** the keyword `ses` is also used to identify any change to the experimental setup of a single subject. E.g., if the electrodes were removed and repositioned, we would count this as a separate session, even though the setup remained identical.

| sub | ses | task_name | run | setup | path_to_emg_file | path_to_labels_file |
|-----|-----|-----------|-----|-------|------------------|---------------------|
| 01 | | rest | 1 | VL_3x4 | sub1/vl_trial1.otb+ | sub1/vl_trial1_mu.mat |
| 01 | | isometric30percentMVC | 1 | VL_3x4 | sub1/vl_trial2.otb+ | sub1/vl_trial2_mu.mat |
| 01 | | isometric50percentMVC | 1 | VL_3x4 | sub1/vl_trial3.otb+ | sub1/vl_trial3_mu.mat |
| 01 | | isometric50percentMVC | 2 | VL_3x4 | sub1/vl_trial4.otb+ | sub1/vl_trial4_mu.mat |
| 02 | 01 | rest | 1 | TA_dual_3x3 | sub2/ta_2grids_trial1.otb+ | sub2/ta_2grids_trial1_mu.mat |
| 02 | 01 | isometric30percentMVC | 1 | TA_dual_3x3 | sub2/ta_2grids_trial2.otb+ | sub2/ta_2grids_trial2_mu.mat |
| 02 | 01 | isometric30percentMVC | 2 | TA_dual_3x3 | sub2/ta_2grids_trial3.otb+ | sub2/ta_2grids_trial3_mu.mat |
| 02 | 02 | isometric30percentMVC | 1 | TA_4x4 | sub2/ta_1grid_trial1.otb+ | sub2/ta_1grid_trial1_mu.mat |
| 02 | 02 | isometric30percentMVC | 2 | TA_4x4 | sub2/ta_1grid_trial2.otb+ | sub2/ta_1grid_trial2_mu.mat |
| 02 | 02 | isometric30percentMVC | 3 | TA_4x4 | sub2/ta_1grid_trial3.otb+ | sub2/ta_1grid_trial3_mu.mat |

---

### Part 2 — Describing hardware setups

With the index files in place, we now describe the three recording configurations in `setup.csv`. Each row names a setup and bundles together the amplifier model, electrode model, acquisition settings, and a short description of the task. Any recording in `recordings.csv` that references a setup name will inherit all of these fields in its `_emg.json` sidecar.

#### `setup.csv`

(1) Amplifier and electrode columns:

| setup_name | Manufacturer | ManufacturersModelName | ElectrodeManufacturer | ElectrodeManufacturersModelName |
|------------|--------------|------------------------|-----------------------|---------------------------------|
| VL_3x4 | OTBioelettronica | Quattrocento | OTBioelettronica | HD08MM0304 |
| TA_dual_3x3 | OTBioelettronica | Quattrocento | OTBioelettronica | HD08MM0303 |
| TA_4x4 | OTBioelettronica | Quattrocento | OTBioelettronica | HD08MM0404 |

(2) Acquisition settings columns:

| setup_name | SamplingFrequency | PowerLineFrequency | RecordingType | SoftwareHighPassHz | SoftwareLowPassHz | HardwareHighPassHz | HardwareLowPassHz | EMGChannelCount | EMGReference | EMGPlacementScheme |
|------------|-------------------|--------------------|---------------|--------------------|-------------------|--------------------|-------------------|-----------------|--------------|---------------------|
| VL_3x4 | 2048 | 50 | continuous | 10 | 900 | 10 | 900 | 12 | monopolar | measured |
| TA_dual_3x3 | 2048 | 50 | continuous | 10 | 900 | 10 | 900 | 18 | monopolar | measured |
| TA_4x4 | 2048 | 50 | continuous | 10 | 900 | 10 | 900 | 16 | monopolar | measured |

(3) Task description columns:

| setup_name | TaskDescription | Instructions |
|------------|-----------------|--------------|
| VL_3x4 | Isometric knee extension at 90 deg of hip flexion and 60 deg of knee flexion. Participants matched force profiles displayed on a screen. | Sit upright in the dynamometer chair. Keep your thigh flat on the seat and follow the force trace on the screen. |
| TA_dual_3x3 | Isometric dorsiflexion at fixed ankle angle (90 deg). Two simultaneous 3x3 grids over proximal and distal right tibialis anterior. Participants matched force profiles displayed on a screen. | Sit with your leg relaxed. Keep your ankle at 90 degrees and follow the force trace on the screen as accurately as you can. |
| TA_4x4 | Isometric dorsiflexion at fixed ankle angle (90 deg). Single 4x4 grid over right tibialis anterior. Participants matched force profiles displayed on a screen. | Sit with your leg relaxed. Keep your ankle at 90 degrees and follow the force trace on the screen as accurately as you can. |

The `EMGChannelCount` reflects only EMG-type channels: 12 for the 3 × 4 grid, 18 for the two simultaneous 3 × 3 grids, and 16 for the 4 × 4 grid. Reference and auxiliary channels (e.g. `Torque`, `R1`) are not counted here — they appear in `channels_electrodes.csv` with their own channel types.

---

### Part 3 — Coordinate systems and electrode channel maps

With the index files in place, we now turn to the three *setup* configurations. Each setup helps produce the `_emg.json`, `_channels.tsv`, `_electrodes.tsv`, and `_coordsystem.json` files *per recording*. We fill in `coordsystems.csv` and `channels_electrodes.csv` — one block of rows per setup.

#### Setup VL_3x4 — sub-01's 3 × 4 grid on right vastus lateralis

The electrode grid was placed over the right vastus lateralis, located by palpating the quadriceps group and centering the grid over the muscle belly. At the end of the recording session, a tape measure was used to locate electrode E1 — the top-left corner of the grid — relative to the greater trochanter: 55 mm lateral, 175 mm distal along the femoral shaft. This single measurement, the *anchor point*, is all we need: because the grid geometry is regular and known (3 × 4 layout, 8 mm spacing), the positions of every other electrode follow automatically.

> **What if you did not measure the anchor?** The EMG-BIDS spec allows omitting `ParentCoordinateSystem`, `AnchorElectrode`, and `AnchorCoordinates` from `_coordsystem.json`. Your `_electrodes.tsv` will still contain valid grid-internal coordinates (each electrode's position relative to E1), but they will not be tied to any anatomical frame — the positions describe electrode geometry relative to one another, not where on the body the grid sat. Note that if you *do* include a `ParentCoordinateSystem`, the spec then requires both `AnchorElectrode` and `AnchorCoordinates`.

A single grid with 3 rows and 4 columns, 8 mm inter-electrode distance. Channels are labelled EMG001–EMG012 in row-major order.

Grid layout — electrode labels (x along columns, y along rows):

```
E1     E2     E3     E4      (y = 0 mm)
E5     E6     E7     E8      (y = 8 mm)
E9     E10    E11    E12     (y = 16 mm)
x=0    x=8    x=16   x=24
```

Correspondingly, our `coordsystems.csv` and `channels_electrodes.csv` rows look like this:

`coordsystems.csv`:

| setup | name | type | units | description | parent_coord_system | anchor_electrode | anchor_x | anchor_y |
|-------|------|------|-------|-------------|---------------------|------------------|----------|----------|
| VL_3x4 | thigh | anatomical | mm | Origin at the greater trochanter. x-axis points distally along the femoral shaft. y-axis points anteriorly. z-axis points medially. | | | | |
| VL_3x4 | grid1 | grid | mm | 3x4 grid over right vastus lateralis. Origin at electrode E1 (top-left corner). x-axis points distally, y-axis points laterally. | thigh | E1 | 55 | 175 |

`channels_electrodes.csv`:

| setup | channel_name | type | units | electrode_name | x | y | z | coordinate_system | reference | group | target_muscle | material | impedance | low_cutoff | high_cutoff |
|-------|--------------|------|-------|----------------|---|---|---|-------------------|-----------|-------|---------------|----------|-----------|------------|-------------|
| VL_3x4 | EMG001 | EMG | uV | E1 | 0 | 0 | 0 | grid1 | R1 | grid1 | right vastus lateralis | Ag/AgCl | n/a | 10 | 900 |
| VL_3x4 | EMG002 | EMG | uV | E2 | 8 | 0 | 0 | grid1 | R1 | grid1 | right vastus lateralis | Ag/AgCl | n/a | 10 | 900 |
| VL_3x4 | EMG003 | EMG | uV | E3 | 16 | 0 | 0 | grid1 | R1 | grid1 | right vastus lateralis | Ag/AgCl | n/a | 10 | 900 |
| VL_3x4 | … | EMG | uV | … | … | … | 0 | grid1 | R1 | grid1 | right vastus lateralis | Ag/AgCl | n/a | 10 | 900 |
| VL_3x4 | EMG012 | EMG | uV | E12 | 24 | 16 | 0 | grid1 | R1 | grid1 | right vastus lateralis | Ag/AgCl | n/a | 10 | 900 |
| VL_3x4 | Torque | MISC | Nm | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| VL_3x4 | R1 | REF | n/a | R1 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Ag/AgCl | n/a | n/a | n/a |

<p class="wt-table-note">EMG004–EMG011 follow the same pattern: x cycles through 0, 8, 16, 24 mm across each column, y increments by 8 mm per row.</p>

> **Notice the distinction:** the grid layout above shows physical electrode labels (E1, E2, …) — the actual objects attached to the skin. The `channels_electrodes.csv` file specifies how each physical electrode maps to a stored data channel on disk: E1 is recorded as channel EMG001, E2 as EMG002, and so on. The reference electrode R1 appears as a REF channel with no spatial coordinates, since its position is not part of the EMG array.

---

#### Setup `TA_dual_3x3` — sub-02 session 1, two simultaneous 3 × 3 grids on right tibialis anterior

Both grids are on the same muscle — one placed over the proximal region, one over the distal region — recorded simultaneously into a single file per trial. Because both grids are on the same body segment, they share one anatomical coordinate system (`lowerLeg`) but each gets its own grid coordinate system (`grid1`, `grid2`), anchored to a different reference electrode.

Grid 1 (proximal TA), channels EMG001–EMG009:

```
E1    E2    E3     (y = 0 mm)
E4    E5    E6     (y = 8 mm)
E7    E8    E9     (y = 16 mm)
x=0   x=8   x=16
```

Grid 2 (distal TA), channels EMG010–EMG018:

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
| TA_dual_3x3 | R1 | REF | n/a | R1 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Ag/AgCl | n/a | n/a | n/a |
| TA_dual_3x3 | R2 | REF | n/a | R2 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Ag/AgCl | n/a | n/a | n/a |

<p class="wt-table-note">EMG001–EMG009 are in <code>grid1</code>, EMG010–EMG018 in <code>grid2</code>. Each grid resets to x=0, y=0 at its own origin — grid2 coordinates are not a continuation of grid1's.</p>

---

#### Setup `TA_4x4` — sub-02 session 2, single 4 × 4 grid on right tibialis anterior

A single grid with 4 rows and 4 columns, 8 mm inter-electrode distance. Channels EMG001–EMG016 in row-major order. The same anatomical coordinate system (`lowerLeg`) is reused; only the anchor point changes because the grid was placed in a different position.

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
| TA_4x4 | grid1 | grid | mm | 4x4 grid over right tibialis anterior. Origin at electrode E1. | lowerLeg | E1 | 28 | 200 |

`channels_electrodes.csv`:

| setup | channel_name | type | units | electrode_name | x | y | z | coordinate_system | reference | group | target_muscle | material | impedance | low_cutoff | high_cutoff |
|-------|--------------|------|-------|----------------|---|---|---|-------------------|-----------|-------|---------------|----------|-----------|------------|-------------|
| TA_4x4 | EMG001 | EMG | uV | E1 | 0 | 0 | 0 | grid1 | R1 | grid1 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_4x4 | EMG002 | EMG | uV | E2 | 8 | 0 | 0 | grid1 | R1 | grid1 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_4x4 | … | EMG | uV | … | … | … | 0 | grid1 | R1 | grid1 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_4x4 | EMG016 | EMG | uV | E16 | 24 | 24 | 0 | grid1 | R1 | grid1 | right tibialis anterior | Ag/AgCl | n/a | 10 | 900 |
| TA_4x4 | Torque | MISC | Nm | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| TA_4x4 | R1 | REF | n/a | R1 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Ag/AgCl | n/a | n/a | n/a |

<p class="wt-table-note">EMG003–EMG015 follow the same pattern as VL_3x4 above: x cycles 0 → 8 → 16 → 24 mm across columns, y increments by 8 mm per row.</p>

---

### Generating EMG-BIDS Metadata

With all five CSV files prepared, head to the MUnitQuest metadata form. The last step of the form asks you to upload your CSVs and fill in a few dataset-level fields (dataset name, authors, licence, institution). Click **Generate & Download** and the tool will produce a `metadata.zip` containing the full set of BIDS sidecar files — one `_emg.json`, `_channels.tsv`, `_electrodes.tsv`, and `_coordsystem.json` per recording, plus `dataset_description.json`, `participants.tsv`, and `participants.json` at the dataset root.

For our tutorial dataset, the generated files produce the following BIDS layout:

#### Uploading the data files

#TODO: The last step would be to upload the data files. For this step you will need to convert your recordings to EDF format — this can be done programmatically and will be covered in a separate tutorial.

---

### Conclusion

After uploading the five CSV files into the tool and downloading `metadata.zip`, the generated files — combined with the converted recording files — produce the following BIDS layout:

```
dataset/
├── dataset_description.json
├── participants.tsv
├── participants.json
│
├── sub-01/
│   ├── sub-01_scans.tsv
│   └── emg/
│       ├── sub-01_task-rest_run-01_emg.edf
│       ├── sub-01_task-rest_run-01_emg.json
│       ├── sub-01_task-rest_run-01_channels.tsv
│       ├── sub-01_task-rest_run-01_electrodes.tsv
│       ├── sub-01_task-isometric30percentMVC_run-01_emg.edf
│       ├── sub-01_task-isometric30percentMVC_run-01_emg.json
│       ├── sub-01_task-isometric30percentMVC_run-01_channels.tsv
│       ├── sub-01_task-isometric30percentMVC_run-01_electrodes.tsv
│       ├── sub-01_task-isometric50percentMVC_run-01_emg.edf
│       ├── sub-01_task-isometric50percentMVC_run-01_emg.json
│       ├── sub-01_task-isometric50percentMVC_run-01_channels.tsv
│       ├── sub-01_task-isometric50percentMVC_run-01_electrodes.tsv
│       ├── sub-01_task-isometric50percentMVC_run-02_emg.edf
│       ├── sub-01_task-isometric50percentMVC_run-02_emg.json
│       ├── sub-01_task-isometric50percentMVC_run-02_channels.tsv
│       ├── sub-01_task-isometric50percentMVC_run-02_electrodes.tsv
│       └── sub-01_coordsystem.json
│
└── sub-02/
    ├── ses-01/
    │   ├── sub-02_ses-01_scans.tsv
    │   └── emg/
    │       ├── sub-02_ses-01_task-rest_run-01_emg.edf
    │       ├── sub-02_ses-01_task-rest_run-01_emg.json
    │       ├── sub-02_ses-01_task-rest_run-01_channels.tsv
    │       ├── sub-02_ses-01_task-rest_run-01_electrodes.tsv
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-01_emg.edf
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-01_emg.json
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-01_channels.tsv
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-01_electrodes.tsv
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-02_emg.edf
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-02_emg.json
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-02_channels.tsv
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-02_electrodes.tsv
    │       └── sub-02_ses-01_coordsystem.json
    └── ses-02/
        ├── sub-02_ses-02_scans.tsv
        └── emg/
            ├── sub-02_ses-02_task-isometric30percentMVC_run-01_emg.edf
            ├── sub-02_ses-02_task-isometric30percentMVC_run-01_emg.json
            ├── sub-02_ses-02_task-isometric30percentMVC_run-01_channels.tsv
            ├── sub-02_ses-02_task-isometric30percentMVC_run-01_electrodes.tsv
            ├── sub-02_ses-02_task-isometric30percentMVC_run-02_emg.edf
            ├── sub-02_ses-02_task-isometric30percentMVC_run-02_emg.json
            ├── sub-02_ses-02_task-isometric30percentMVC_run-02_channels.tsv
            ├── sub-02_ses-02_task-isometric30percentMVC_run-02_electrodes.tsv
            ├── sub-02_ses-02_task-isometric30percentMVC_run-03_emg.edf
            ├── sub-02_ses-02_task-isometric30percentMVC_run-03_emg.json
            ├── sub-02_ses-02_task-isometric30percentMVC_run-03_channels.tsv
            ├── sub-02_ses-02_task-isometric30percentMVC_run-03_electrodes.tsv
            └── sub-02_ses-02_coordsystem.json
```

Each recording has its own `_emg.json`, `_channels.tsv`, and `_electrodes.tsv` sidecar files, all generated from the three setups defined in your CSVs. The `_coordsystem.json` is shared across all recordings within a session and is placed at the session (or subject) level.

Once you have the metadata ZIP and your recordings converted to EDF, you have everything needed for a fully BIDS-compliant HD-EMG dataset — self-describing, shareable, and ready for any BIDS-compatible tool or repository.
