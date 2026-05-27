---
title: "MUnitQuest EMG-BIDS Tutorial"
feature_image: "/Images/header.jpeg"
layout: page
---


### Getting Started

This tutorial walks you through preparing a real HD-EMG dataset for sharing using the [EMG-BIDS](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electromyography.html) standard. By the end, you will have a complete set of BIDS-compliant metadata files ready to accompany your recordings.

The process has two stages: first, we fill in five simple CSV files that capture everything BIDS needs to know about the dataset - participants, recordings, hardware, electrode layout, and coordinate systems. Second, we upload those CSVs into the [MUnitQuest metadata tool](/metadata-form/) — along with a short online form for dataset-level details — and download a ZIP containing all the generated metadata files.

#### Prerequisites

- A version of the dataset you would like to share or archive
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

This file contains one row per recording file. The `setup` column links each recording to its hardware and electrode configuration. In our dataset, as we indicated before, three distinct setups appear: `VL_3x4s_1i`, `TA_dual_3x3`, and `TA_4x4`. Each will generate its own set of BIDS metadata files.

Subject 1 has only a single session, so `ses` field is left blank. Subject 2's three recordings from each session reference different setups because the grid configuration changed between sessions.

> **Note:** the keyword `ses` is also used to identify any change to the experimental setup of a single subject. E.g., if the electrodes were removed and repositioned, we would count this as a separate session, even though the setup remained identical.

| sub | ses | task_name | run | setup | path_to_emg_file | path_to_labels_file |
|-----|-----|-----------|-----|-------|------------------|---------------------|
| 01 | | rest | 1 | VL_3x4s_1i | sub1/vl_trial1.otb+ | sub1/vl_trial1_mu.mat |
| 01 | | isometric30percentMVC | 1 | VL_3x4s_1i | sub1/vl_trial2.otb+ | sub1/vl_trial2_mu.mat |
| 01 | | isometric50percentMVC | 1 | VL_3x4s_1i | sub1/vl_trial3.otb+ | sub1/vl_trial3_mu.mat |
| 01 | | isometric50percentMVC | 2 | VL_3x4s_1i | sub1/vl_trial4.otb+ | sub1/vl_trial4_mu.mat |
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

(1) Amplifier columns:

| setup_name | Manufacturer | ManufacturersModelName |
|------------|--------------|------------------------|
| VL_3x4s_1i | OTBioelettronica | Quattrocento |
| TA_dual_3x3 | OTBioelettronica | Quattrocento |
| TA_4x4 | OTBioelettronica | Quattrocento |

`ElectrodeManufacturer` and `ElectrodeManufacturersModelName` have been moved to `channels_electrodes.csv`. This allows different electrode models within the same setup — as is the case for `VL_3x4s_1i`, where the surface grid (OTBioelettronica HD08MM0304) and the intramuscular wire (Natus Medical WE-DN1.5) are different products — to each carry their own provenance.

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

The `EMGChannelCount` reflects all EMG-type channels: 13 for `VL_3x4s_1i` (12 surface + 1 intramuscular), 18 for the two simultaneous 3 × 3 grids, and 16 for the 4 × 4 grid. Reference and auxiliary channels (e.g. `Torque`, `R1`) are not counted here — they appear in `channels_electrodes.csv` with their own channel types, alongside the `ElectrodeManufacturer` and `ElectrodeManufacturersModelName` columns that now live there.

---

### Part 3 — Coordinate systems and electrode channel maps

With the index files in place, we now turn to the three *setup* configurations. Each setup helps produce the `_emg.json`, `_channels.tsv`, `_electrodes.tsv`, and `_coordsystem.json` files *per recording*. We fill in `coordsystems.csv` and `channels_electrodes.csv` — one block of rows per setup.

#### Setup VL_3x4s_1i — sub-01's 3 × 4 surface grid + 1 intramuscular wire on right vastus lateralis

The electrode grid was placed over the right vastus lateralis, located by palpating the quadriceps group and centering the grid over the muscle belly. A single intramuscular fine wire electrode (E_im) was inserted approximately midway across the grid, between E6 and E7. At the end of the recording session, a tape measure was used to locate electrode E1 — the top-left corner of the grid — relative to the greater trochanter: 55 mm lateral, 175 mm distal along the femoral shaft. This single measurement, the *anchor point*, is all we need for the surface electrodes: because the grid geometry is regular and known (3 × 4 layout, 8 mm spacing), the positions of every other surface electrode follow automatically.

For the intramuscular wire, we reuse the `grid1` coordinate system. Its x and y coordinates give the skin insertion point in the grid frame (x=12, y=8 — between columns 2 and 3, second row), and z gives the insertion depth into the muscle (12 mm). The `grid1` coordsystem description is extended to state that z represents insertion depth for intramuscular entries.

> **What if you did not measure the anchor?** The EMG-BIDS spec allows omitting `ParentCoordinateSystem`, `AnchorElectrode`, and `AnchorCoordinates` from `_coordsystem.json`. Your `_electrodes.tsv` will still contain valid grid-internal coordinates (each electrode's position relative to E1), but they will not be tied to any anatomical frame — the positions describe electrode geometry relative to one another, not where on the body the grid sat. Note that if you *do* include a `ParentCoordinateSystem`, the spec then requires both `AnchorElectrode` and `AnchorCoordinates`.

A single grid with 3 rows and 4 columns, 8 mm inter-electrode distance. Surface channels are labelled EMG001–EMG012 in row-major order; the intramuscular wire is EMG013.

Grid layout — electrode labels (x along columns, y along rows):

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
| VL_3x4s_1i | R1 | REF | n/a | R1 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Ag/AgCl | OTBioelettronica | n/a | n/a | n/a | n/a |

<p class="wt-table-note">EMG002–EMG011 follow the same pattern as EMG001: x cycles through 0, 8, 16, 24 mm across each column, y increments by 8 mm per row, z=0. EMG013 is the only channel with a non-zero z value.</p>
> **Note:** the grid layout above shows physical electrode labels (E1, E2, …, E_im) — the actual objects attached to or inserted into the tissue. The `channels_electrodes.csv` file specifies how each physical electrode maps to a stored data channel on disk: E1 → EMG001, …, E12 → EMG012, E_im → EMG013. Surface electrodes all sit at z=0 in the grid frame while the intramuscular wire is at z=12 (12 mm insertion depth). The reference electrode R1 appears as a REF channel with no spatial coordinates, since its position is not part of the EMG array.


---

#### Setup TA_dual_3x3 — sub-02 session 1, two simultaneous 3 × 3 grids on right tibialis anterior

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

#### Setup TA_4x4 — sub-02 session 2, single 4 × 4 grid on right tibialis anterior

In this setup, a single grid with 4 rows and 4 columns, 8 mm inter-electrode distance. Channels EMG001–EMG016 in row-major order. However, the electrode position relative to anatomical landmarks was not recorded, so no anatomical row appears in `coordsystems.csv`. The grid-internal positions are still fully specified — they describe electrode geometry relative to E1 — but they are not tied to any body landmark. This produces a single `space-grid1_coordsystem.json` for this setup/ session, with no `ParentCoordinateSystem`, `AnchorElectrode`, or `AnchorCoordinates` fields.

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
| TA_4x4 | grid1 | grid | mm | 4x4 grid over right tibialis anterior. Origin at electrode E1 (top-left corner). x-axis points distally, y-axis points laterally. No anatomical landmark measures available. | | | | |

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

### Uploading the data files

Your recording files must be in **EDF (European Data Format)** to accompany the BIDS metadata. The scripts below read the two CSV files you have already filled in (`recordings.csv` and `channels_electrodes.csv`), look up the correct channel names for each setup automatically, and assemble the full BIDS folder in one call — including extracting `metadata.zip`.

The only assumption is that your original acquisition files (`.otb+` or similar) have been exported to language-native arrays: `.npy` / `.npz` for Python, `.mat` for MATLAB, each with shape **n_channels × n_samples** (Python) or **n_samples × n_channels** (MATLAB).

<div class="code-tabs">
<div class="tab-pane" data-label="Python">
<pre><code class="language-python">import numpy as np
import pandas as pd
import pyedflib
import zipfile
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
                "physical_min":     float(data[i].min()),
                "physical_max":     float(data[i].max()),
                "digital_min":      -32768,
                "digital_max":       32767,
                "dimension": "", "transducer": "", "prefilter": "",
            }
            for i, ch in enumerate(channel_names)
        ]
        f.setSignalHeaders(headers)
        f.writeSamples(data)


def assemble_bids_dataset(recordings_csv, channels_csv, metadata_zip,
                           data_dir, output_dir, fs):
    """
    Build a complete BIDS dataset folder.

    recordings_csv -- path to your filled-in recordings.csv
    channels_csv   -- path to your filled-in channels_electrodes.csv
    metadata_zip   -- path to metadata.zip downloaded from the MUnitQuest tool
    data_dir       -- root folder; path_to_emg_file values are relative to this
                      (.npy: shape n_channels x n_samples;
                       .npz: same array stored under key "data")
    output_dir     -- destination folder (created if needed)
    fs             -- sampling frequency in Hz
    """
    output_dir = Path(output_dir)

    # 1. Unpack BIDS sidecar files
    with zipfile.ZipFile(metadata_zip) as zf:
        zf.extractall(output_dir)

    # 2. Write one EDF per recording
    recs = pd.read_csv(recordings_csv, dtype=str).fillna("")
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
        bids_name = "_".join(parts) + "_emg.edf"

        subdir = output_dir / sub / (f"ses-{int(ses):02d}" if ses else "")
        out_path = subdir / "emg" / bids_name

        src = Path(data_dir) / row["path_to_emg_file"].strip()
        data = np.load(src)["data"] if src.suffix == ".npz" else np.load(src)

        channel_names = get_channel_names(channels_csv, setup)
        write_edf(out_path, data, channel_names, fs)
        print(f"  wrote {out_path.relative_to(output_dir)}")

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
<pre><code class="language-matlab">% Requires R2020b+ for edfwrite.
% Save each function in its own .m file, or paste all three into a script
% and call assembleBidsDataset at the bottom.


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
end


function assembleBidsDataset(recordingsCsv, channelsCsv, metadataZip, ...
                              dataDir, outputDir, fs)
    % Build a complete BIDS dataset folder.
    %
    % recordingsCsv -- path to your filled-in recordings.csv
    % channelsCsv   -- path to your filled-in channels_electrodes.csv
    % metadataZip   -- path to metadata.zip downloaded from the MUnitQuest tool
    % dataDir       -- root folder; path_to_emg_file values are relative to this
    %                  (.mat files must contain a single variable [n_samples x n_channels])
    % outputDir     -- destination folder
    % fs            -- sampling frequency in Hz

    % 1. Unpack BIDS sidecar files
    unzip(metadataZip, outputDir);

    % 2. Write one EDF per recording
    recs = readtable(recordingsCsv, "TextType", "string");
    for i = 1:height(recs)
        row   = recs(i, :);
        sub   = sprintf("sub-%02d", str2double(row.sub{1}));
        ses   = strtrim(row.ses{1});   hasSes = ses ~= "" && ~ismissing(ses);
        task  = strtrim(row.task_name{1});
        run   = row.run;               hasRun = ~ismissing(run);
        setup = strtrim(row.setup{1});

        sesPart = ""; runPart = "";
        if hasSes, sesPart = sprintf("ses-%02d_", str2double(ses)); end
        if hasRun, runPart = sprintf("_run-%02d", run); end
        bidsName = sprintf("%s_%stask-%s%s_emg.edf", sub, sesPart, task, runPart);

        if hasSes
            outPath = fullfile(outputDir, sub, sprintf("ses-%02d", str2double(ses)), "emg", bidsName);
        else
            outPath = fullfile(outputDir, sub, "emg", bidsName);
        end

        loaded = load(fullfile(dataDir, row.path_to_emg_file{1}));
        fields = fieldnames(loaded);
        data   = loaded.(fields{1});   % [n_samples x n_channels]

        channelNames = getChannelNames(channelsCsv, setup);
        writeEdf(outPath, data, channelNames, fs);
        fprintf("  wrote %s\n", strrep(outPath, outputDir, ""));
    end
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

### Spike-train event files

Motor-unit decomposition results are stored as BIDS events files under a `derivatives/` subfolder. Each spike train becomes a set of rows with `onset` (seconds from recording start), `duration` (0), and `trial_type` (motor-unit label):

```python
def write_events_tsv(out_path: Path, spike_trains: dict, fs: float) -> None:
    """Write BIDS events.tsv from a dict of {mu_label: sample_index_array}."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    rows = []
    for mu_label in sorted(spike_trains.keys()):
        for sample in spike_trains[mu_label]:
            rows.append({"onset": round(float(sample) / fs, 6), "duration": 0.0, "trial_type": mu_label})
    df = pd.DataFrame(rows, columns=["onset", "duration", "trial_type"])
    df.sort_values("onset").reset_index(drop=True).to_csv(out_path, sep="\t", index=False)
```

Events files mirror the raw folder structure under `derivatives/<pipeline-name>/`, with a `desc-decomposition` entity inserted before the suffix:

```
derivatives/motor-unit-decomposition/
    sub-01/emg/sub-01_task-rest_run-01_desc-decomposition_events.tsv
    ...
```

The pipeline folder also needs its own `dataset_description.json` with `"DatasetType": "derivative"`. A `.bidsignore` file at the dataset root (containing `derivatives/`) tells the BIDS validator to skip the derivatives subtree when validating the raw dataset.

---

### Conclusion

After uploading the five CSV files into the tool and downloading `metadata.zip`, the generated files — combined with the converted recording files — produce the following BIDS layout:

```
dataset/
├── .bidsignore
├── dataset_description.json
├── participants.tsv
├── participants.json
├── derivatives/
│   └── motor-unit-decomposition/  (spike-train events + dataset_description.json)
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
│       ├── sub-01_task-isometric50percentMVC_run-01_emg.edf
│       ├── sub-01_task-isometric50percentMVC_run-01_emg.json
│       ├── sub-01_task-isometric50percentMVC_run-01_channels.tsv
│       ├── sub-01_task-isometric50percentMVC_run-02_emg.edf
│       ├── sub-01_task-isometric50percentMVC_run-02_emg.json
│       └── sub-01_task-isometric50percentMVC_run-02_channels.tsv
│
└── sub-02/
    ├── ses-01/
    │   └── emg/
    │       ├── sub-02_ses-01_electrodes.tsv
    │       ├── sub-02_ses-01_space-lowerLeg_coordsystem.json
    │       ├── sub-02_ses-01_space-grid1_coordsystem.json
    │       ├── sub-02_ses-01_space-grid2_coordsystem.json
    │       ├── sub-02_ses-01_task-rest_run-01_emg.edf
    │       ├── sub-02_ses-01_task-rest_run-01_emg.json
    │       ├── sub-02_ses-01_task-rest_run-01_channels.tsv
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-01_emg.edf
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-01_emg.json
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-01_channels.tsv
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-02_emg.edf
    │       ├── sub-02_ses-01_task-isometric30percentMVC_run-02_emg.json
    │       └── sub-02_ses-01_task-isometric30percentMVC_run-02_channels.tsv
    └── ses-02/
        └── emg/
            ├── sub-02_ses-02_electrodes.tsv
            ├── sub-02_ses-02_space-grid1_coordsystem.json
            ├── sub-02_ses-02_task-isometric30percentMVC_run-01_emg.edf
            ├── sub-02_ses-02_task-isometric30percentMVC_run-01_emg.json
            ├── sub-02_ses-02_task-isometric30percentMVC_run-01_channels.tsv
            ├── sub-02_ses-02_task-isometric30percentMVC_run-02_emg.edf
            ├── sub-02_ses-02_task-isometric30percentMVC_run-02_emg.json
            ├── sub-02_ses-02_task-isometric30percentMVC_run-02_channels.tsv
            ├── sub-02_ses-02_task-isometric30percentMVC_run-03_emg.edf
            ├── sub-02_ses-02_task-isometric30percentMVC_run-03_emg.json
            └── sub-02_ses-02_task-isometric30percentMVC_run-03_channels.tsv
```

Each recording has its own `_emg.json` and `_channels.tsv`. `_electrodes.tsv` and `_coordsystem.json` files are **inherited** — shared across all recordings in a session and placed at the session (or subject) level. There is one `_coordsystem.json` per coordinate space: sub-01 gets two (anatomical + grid), sub-02 session 1 gets three (anatomical + two grids), and sub-02 session 2 gets one (grid only, since no anatomical landmark was measured in that session).

Once you have the metadata ZIP and your recordings converted to EDF, you have everything needed for a fully BIDS-compliant HD-EMG dataset — self-describing, shareable, and ready for any BIDS-compatible tool or repository.
