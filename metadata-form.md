---
title: Metadata Form
feature_image: "https://raw.githubusercontent.com/MUnitQuest/MUnitQuest.github.io/refs/heads/main/Images/header2.jpeg"
layout: page
---

<p>Fill in the fields below to describe your dataset. When you reach the final step, click <strong>Download metadata.json</strong> — a JSON file will be saved to your computer. Upload this file alongside your data ZIP to the shared drive. Your progress is saved automatically in your browser.</p>

<div class="metadata-form">

<div class="mf-progress-bar">
    <div class="mf-progress-step active" data-step="1">
        <div class="mf-step-number">1</div>
        <div class="mf-step-label">Team Info</div>
    </div>
    <div class="mf-progress-step" data-step="2">
        <div class="mf-step-number">2</div>
        <div class="mf-step-label">Data Type</div>
    </div>
    <div class="mf-progress-step" data-step="3">
        <div class="mf-step-number">3</div>
        <div class="mf-step-label">Dataset Info</div>
    </div>
    <div class="mf-progress-step" data-step="4">
        <div class="mf-step-number">4</div>
        <div class="mf-step-label">Participants</div>
    </div>
    <div class="mf-progress-step" data-step="5">
        <div class="mf-step-number">5</div>
        <div class="mf-step-label">Recording</div>
    </div>
    <div class="mf-progress-step" data-step="6">
        <div class="mf-step-number">6</div>
        <div class="mf-step-label">Task Protocol</div>
    </div>
    <div class="mf-progress-step" data-step="7">
        <div class="mf-step-number">7</div>
        <div class="mf-step-label">Labeling</div>
    </div>
    <div class="mf-progress-step" data-step="8">
        <div class="mf-step-number">8</div>
        <div class="mf-step-label">Review</div>
    </div>
</div>

<form id="submissionForm" class="mf-submission-form">

    <!-- Section 1: Team & Dataset Information -->
    <section class="form-section active" data-section="1">
        <h2>Team &amp; Dataset Information</h2>

        <div class="mf-form-group">
            <label for="teamName">Team Name *</label>
            <input type="text" id="teamName" name="teamName" required>
            <small>This will be your identifier in the competition</small>
        </div>

        <div class="mf-form-group">
            <label for="teamLeaderName">Team Leader Name *</label>
            <input type="text" id="teamLeaderName" name="teamLeaderName" required>
        </div>

        <div class="mf-form-group">
            <label for="teamLeaderEmail">Team Leader Email *</label>
            <input type="email" id="teamLeaderEmail" name="teamLeaderEmail" required>
        </div>

        <div class="mf-form-group">
            <label for="datasetName">Dataset Name *</label>
            <input type="text" id="datasetName" name="datasetName" required>
            <small>Short identifier (e.g., "TibAnt_Isometric_2025")</small>
        </div>

        <div class="mf-form-group">
            <label for="datasetDescription">Dataset Description</label>
            <textarea id="datasetDescription" name="datasetDescription" rows="4" maxlength="500"></textarea>
            <small class="char-count">0 / 500 characters</small>
        </div>
    </section>

    <!-- Section 2: Data Type Selection -->
    <section class="form-section" data-section="2">
        <h2>Data Type Selection</h2>

        <div class="mf-form-group">
            <label>Data Type *</label>
            <div class="mf-radio-group">
                <label class="mf-radio-card">
                    <input type="radio" name="dataType" value="experimental" required>
                    <div class="mf-radio-content">
                        <strong>Experimental HDsEMG</strong>
                        <p>Surface EMG recordings with labelled motor unit spike trains</p>
                    </div>
                </label>

                <label class="mf-radio-card">
                    <input type="radio" name="dataType" value="experimental_iemg">
                    <div class="mf-radio-content">
                        <strong>Experimental HDsEMG + concurrent iEMG</strong>
                        <p>Surface EMG with simultaneous intramuscular validation</p>
                    </div>
                </label>

                <label class="mf-radio-card">
                    <input type="radio" name="dataType" value="synthetic_full">
                    <div class="mf-radio-content">
                        <strong>Synthetic (Full-Spectrum Simulation)</strong>
                        <p>End-to-end simulation including motor unit pool, volume conduction, and electrode interface</p>
                    </div>
                </label>

                <label class="mf-radio-card">
                    <input type="radio" name="dataType" value="synthetic_hybrid">
                    <div class="mf-radio-content">
                        <strong>Synthetic (Hybrid Simulation)</strong>
                        <p>Experimental MUAP waveforms combined with simulated spike trains</p>
                    </div>
                </label>
            </div>
        </div>
    </section>

    <!-- Section 3: General Dataset Metadata -->
    <section class="form-section" data-section="3">
        <h2>General Dataset Metadata</h2>

        <div class="mf-form-group">
            <label for="license">License *</label>
            <select id="license" name="license" required>
                <option value="">Select a license</option>
                <option value="CC0">CC0 - Public Domain</option>
                <option value="CC-BY-4.0">CC-BY-4.0 - Attribution Required</option>
                <option value="CC-BY-NC-4.0">CC-BY-NC-4.0 - Non-Commercial</option>
                <option value="other">Other (specify)</option>
            </select>
        </div>

        <div class="mf-form-group" id="otherLicenseGroup" style="display:none;">
            <label for="otherLicense">Specify License</label>
            <input type="text" id="otherLicense" name="otherLicense">
        </div>

        <div class="mf-form-group">
            <label>Authors *</label>
            <div id="authorsList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addAuthor('authorsList')">
                + Add Author
            </button>
        </div>

        <div class="mf-form-group">
            <label>Funding sources</label>
            <div id="fundingList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addFunding('fundingList')">
                + Add Funding source
            </button>
        </div> 

        <div class="mf-form-group">
            <label>Ethics Approvals *</label>
            <div id="ethicsList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addEthics('ethicsList')">
                + Add Ethics approval
            </button>
        </div> 

        <div class="mf-form-group">
            <label>References and Links</label>
            <div id="referencesList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addReference('referencesList')">
                + Add Reference
            </button>
        </div> 

        <div class="mf-form-group">
            <label for="institutionName">Institution Name *</label>
            <input type="text" id="institutionName" name="institutionName" required>
        </div>

        <div class="mf-form-group">
            <label for="institutionAddress">Institution Address</label>
            <input type="text" id="institutionAddress" name="institutionAddress">
        </div>
    </section>

    <!-- Section 4: Participant Information -->
    <section class="form-section" data-section="4">
        <h2>Participant Information</h2>

        <div class="mf-form-group">
            <label>Subjects *</label>

            <div id="subjectsList">
                <div class="mf-subject-entry">
                    <div class="mf-subject-fields">

                        <div class="mf-field-row">
                            <span class="mf-field-label">Name</span>
                            <input type="text" name="participant_id[]" placeholder="Participant ID" required>
                        </div>

                        <div class="mf-field-row">
                            <span class="mf-field-label">Age</span>
                            <input type="number" name="subjects_age[]" placeholder="Age" min="0" required>
                        </div>

                        <div class="mf-field-row">
                            <span class="mf-field-label">Height</span>
                            <input type="number" name="subjects_height[]" placeholder="cm" min="0" step="0.1">
                        </div>

                        <div class="mf-field-row">
                            <span class="mf-field-label">Weight</span>
                            <input type="number" name="subjects_weight[]" placeholder="kg" min="0" step="0.1">
                        </div>

                        <button type="button"
                                class="mf-btn-remove"
                                onclick="removeSubject(this)"
                                style="display:none;">
                            Remove
                        </button>

                    </div>
                </div>
            </div>

            <button type="button" class="mf-btn-secondary" onclick="addSubject()">
                + Add Subject
            </button>
        </div>

        <div class="mf-form-group">
            <label for="numParticipants">Number of Participants *</label>
            <input type="number" id="numParticipants" name="numParticipants" min="1" required>
        </div>

        <div class="mf-form-group">
            <label>Age Range</label>
            <div class="mf-range-inputs">
                <input type="number" id="ageMin" name="ageMin" placeholder="Min" min="18" max="100">
                <span>to</span>
                <input type="number" id="ageMax" name="ageMax" placeholder="Max" min="18" max="100">
                <span>years</span>
            </div>
        </div>

        <div class="mf-form-group">
            <label>Biological Sex Distribution</label>
            <div class="mf-checkbox-group">
                <label>
                    <input type="checkbox" name="sexFemale" id="sexFemale">
                    Female
                    <input type="number" id="femaleCount" name="femaleCount" placeholder="Count" min="0" style="width:80px; margin-left:10px;">
                </label>
                <label>
                    <input type="checkbox" name="sexMale" id="sexMale">
                    Male
                    <input type="number" id="maleCount" name="maleCount" placeholder="Count" min="0" style="width:80px; margin-left:10px;">
                </label>
                <label>
                    <input type="checkbox" name="sexOther" id="sexOther">
                    Other/Prefer not to say
                    <input type="number" id="otherCount" name="otherCount" placeholder="Count" min="0" style="width:80px; margin-left:10px;">
                </label>
            </div>
        </div>

        <div class="mf-form-group">
            <label>Health Status *</label>
            <div class="mf-radio-group">
                <label>
                    <input type="radio" name="healthStatus" value="healthy" required>
                    Healthy controls only
                </label>
                <label>
                    <input type="radio" name="healthStatus" value="pathological">
                    Pathological cohort only
                </label>
                <label>
                    <input type="radio" name="healthStatus" value="mixed">
                    Mixed (healthy + pathological)
                </label>
            </div>
        </div>

        <div class="mf-form-group" id="pathologicalConditionsGroup" style="display:none;">
            <label for="pathologicalConditions">Specify Pathological Conditions</label>
            <input type="text" id="pathologicalConditions" name="pathologicalConditions">
        </div>
    </section>

    <!-- Section 5: Recording Information -->
    <section class="form-section" data-section="5">
        <h2>Recording Information</h2>

        <h3>Hardware &amp; Acquisition</h3>

        <div class="mf-form-group">
            <label for="manufacturer">Manufacturer *</label>
            <input type="text" id="manufacturer" name="manufacturer" placeholder="Manufacturer of your EMG amplifier." required>
        </div>

        <div class="mf-form-group">
            <label for="manufacturerModel">Manufacturer's Model Name *</label>
            <input type="text" id="manufacturerModel" name="manufacturerModel" placeholder="Model name of your EMG amplifier." required>
        </div>

        <div class="mf-form-group">
            <label for="softwareVersions">Software versions *</label>
            <input type="text" id="softwareVersions" name="softwareVersions" placeholder="Version of the softwrae used for the recording" required>
        </div>

        <div class="mf-form-group">
            <label for="samplingFrequency">Sampling Frequency (Hz) *</label>
            <input type="number" id="samplingFrequency" name="samplingFrequency" required>
        </div>

        <div class="mf-form-group">
            <label for="powerLineFrequency">Power Line Frequency *</label>
            <select id="powerLineFrequency" name="powerLineFrequency" required>
                <option value="">Select</option>
                <option value="50">50 Hz</option>
                <option value="60">60 Hz</option>
                <option value="n/a">Not applicable</option>
            </select>
        </div>

        <div class="mf-form-group">
            <label for="highPassFilter">High-pass Filter *</label>
            <input type="number" id="highPassFilter" name="highPassFilter" required>
        </div>

        <div class="mf-form-group">
            <label for="lowPassFilter">Low-pass Filter *</label>
            <input type="number" id="lowPassFilter" name="lowPassFilter" required>
        </div>

        <h3>Electrode Configuration</h3>

        <div class="mf-form-group">
            <label for="emgChannelCount">EMG Channel Count *</label>
            <input type="number" id="emgChannelCount" name="emgChannelCount" min="1" required>
        </div>

        <div class="mf-form-group">
            <label for="emgChannelUnits">Units *</label>
            <select id="emgChannelUnits" name="emgChannelUnits">
                <option value="">Select</option>
                <option value="V">V</option>
                <option value="mV">mV</option>
                <option value="uV">uV</option>
            </select>
        </div>

        <div class="mf-form-group">
            <label for="electrodeMaterial">Electrode Material</label>
            <select id="electrodeMaterial" name="electrodeMaterial">
                <option value="">Select</option>
                <option value="Ag/AgCl">Ag/AgCl</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
                <option value="other">Other</option>
            </select>
        </div>

        <div class="mf-form-group">
            <label for="electrodeShape">Electrode Shape</label>
            <select id="electrodeShape" name="electrodeShape">
                <option value="">Select</option>
                <option value="disc">Disc</option>
                <option value="ring">Ring</option>
                <option value="pad">Pad</option>
                <option value="other">Other</option>
            </select>
        </div>

        <div class="mf-form-group">
            <label for="electrodeDiameter">Electrode Diameter (mm)</label>
            <input type="number" id="electrodeDiameter" name="electrodeDiameter" step="0.1">
        </div>

        <div class="mf-form-group">
            <label for="interElectrodeDistance">Inter-Electrode Distance (mm) *</label>
            <input type="number" id="interElectrodeDistance" name="interElectrodeDistance" step="0.1" required>
        </div>

        <div class="mf-form-group">
            <label for="electrodeArrayType">Electrode Array Type</label>
            <input type="text" id="electrodeArrayType" name="electrodeArrayType" placeholder="e.g., 8x8 grid, 16x4 linear">
        </div>

        <div class="mf-form-group">
            <label for="electrodePlacement">Electrode Placement *</label>
            <input type="text" id="electrodePlacement" name="electrodePlacement" placeholder="e.g., tibialis anterior, middle of muscle belly" required>
        </div>

        <h3>Reference &amp; Ground</h3>

        <div class="mf-form-group">
            <label for="emgReference">EMG Reference *</label>
            <input type="text" id="emgReference" name="emgReference" placeholder="e.g., single differential, bipolar derivation" required>
        </div>

        <div class="mf-form-group">
            <label for="emgGround">EMG Ground *</label>
            <input type="text" id="emgGround" name="emgGround" placeholder="e.g., wrist, electrode on patella" required>
        </div>

        <h3>MISC Channels</h3>

        <div class="mf-form-group">
            <label>MISCs *</label>

            <div id="subjectsList">
                <div class="mf-misc-entry">
                    <div class="mf-misc-fields">
                        <input type="text" name="description[]" placeholder="Anlke torque or requested effort trajetory" required>
                        <input type="text" name="units[]" placeholder="e.g., V or % MVC" required>

                        <button type="button"
                                class="mf-btn-remove"
                                onclick="removeMISC(this)"
                                style="display:none;">
                            Remove
                        </button>
                    </div>
                </div>
            </div>

            <button type="button" class="mf-btn-secondary" onclick="addMISC()">
                + Add MISC
            </button>
        </div>

    </section>

    <!-- Section 6: Task & Protocol Information -->
    <section class="form-section" data-section="6">
        <h2>Task &amp; Protocol Information</h2>

        <div class="mf-form-group">
            <label for="taskName">Task Name *</label>
            <input type="text" id="taskName" name="taskName" placeholder="e.g., isometric-ankle-dorsiflexion" required>
        </div>

        <div class="mf-form-group">
            <label for="taskDescription">Task Description *</label>
            <textarea id="taskDescription" name="taskDescription" rows="4" maxlength="500" required></textarea>
            <small class="char-count">0 / 500 characters</small>
        </div>

        <div class="mf-form-group">
            <label for="instructions">Instructions to Participants</label>
            <textarea id="instructions" name="instructions" rows="3"></textarea>
        </div>

        <div class="mf-form-group">
            <label>Contraction Type * (check all that apply)</label>
            <div class="mf-checkbox-group">
                <label>
                    <input type="checkbox" name="contractionIsometric" id="contractionIsometric">
                    Isometric
                </label>
                <label>
                    <input type="checkbox" name="contractionConcentric" id="contractionConcentric">
                    Dynamic (concentric)
                </label>
                <label>
                    <input type="checkbox" name="contractionEccentric" id="contractionEccentric">
                    Dynamic (eccentric)
                </label>
                <label>
                    <input type="checkbox" name="contractionMixed" id="contractionMixed">
                    Dynamic (mixed)
                </label>
            </div>
        </div>

        <!-- Isometric-specific fields -->
        <div id="isometricFields" style="display:none;">
            <h3>Isometric Contraction Details</h3>
            <div class="mf-form-group">
                <label for="targetForceLevels">Target Force Levels</label>
                <input type="text" id="targetForceLevels" name="targetForceLevels" placeholder="e.g., 10%, 30%, 50% MVC">
            </div>
            <div class="mf-form-group">
                <label for="contractionDuration">Contraction Duration (seconds)</label>
                <input type="number" id="contractionDuration" name="contractionDuration" step="0.1">
            </div>
            <div class="mf-form-group">
                <label for="restDuration">Rest Duration (seconds)</label>
                <input type="number" id="restDuration" name="restDuration" step="0.1">
            </div>
        </div>

        <!-- Dynamic-specific fields -->
        <div id="dynamicFields" style="display:none;">
            <h3>Dynamic Contraction Details</h3>
            <div class="mf-form-group">
                <label for="jointROM">Joint Range of Motion</label>
                <input type="text" id="jointROM" name="jointROM" placeholder="e.g., ankle: 0-30° dorsiflexion">
            </div>
            <div class="mf-form-group">
                <label for="movementSpeed">Movement Speed</label>
                <input type="text" id="movementSpeed" name="movementSpeed" placeholder="e.g., 60°/s">
            </div>
            <div class="mf-form-group">
                <label for="loadType">Load Type</label>
                <select id="loadType" name="loadType">
                    <option value="">Select</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="external">External load</option>
                    <option value="isokinetic">Isokinetic</option>
                </select>
            </div>
        </div>

        <div class="mf-form-group">
            <label for="numTrials">Number of Trials/Runs *</label>
            <input type="number" id="numTrials" name="numTrials" min="1" required>
        </div>

        <h3>Auxiliary Data</h3>

        <div class="mf-form-group">
            <label>Force Data Included? *</label>
            <div class="mf-radio-group">
                <label>
                    <input type="radio" name="forceDataIncluded" value="yes" required>
                    Yes
                </label>
                <label>
                    <input type="radio" name="forceDataIncluded" value="no">
                    No
                </label>
            </div>
        </div>

        <div id="forceDataFields" style="display:none;">
            <div class="mf-form-group">
                <label for="forceSensorType">Force Sensor Type</label>
                <input type="text" id="forceSensorType" name="forceSensorType">
            </div>
            <div class="mf-form-group">
                <label for="forceSamplingFrequency">Force Sampling Frequency (Hz)</label>
                <input type="number" id="forceSamplingFrequency" name="forceSamplingFrequency">
            </div>
            <div class="mf-form-group">
                <label for="forceUnits">Force Units</label>
                <select id="forceUnits" name="forceUnits">
                    <option value="">Select</option>
                    <option value="N">Newtons (N)</option>
                    <option value="Nm">Newton-meters (Nm)</option>
                    <option value="%MVC">Percent MVC (%MVC)</option>
                </select>
            </div>
        </div>

        <div class="mf-form-group">
            <label>Kinematics Data Included? *</label>
            <div class="mf-radio-group">
                <label>
                    <input type="radio" name="kinematicsDataIncluded" value="yes" required>
                    Yes
                </label>
                <label>
                    <input type="radio" name="kinematicsDataIncluded" value="no">
                    No
                </label>
            </div>
        </div>

        <div id="kinematicsDataFields" style="display:none;">
            <div class="mf-form-group">
                <label for="motionCaptureSystem">Motion Capture System</label>
                <input type="text" id="motionCaptureSystem" name="motionCaptureSystem">
            </div>
            <div class="mf-form-group">
                <label for="kinematicsSamplingFrequency">Kinematics Sampling Frequency (Hz)</label>
                <input type="number" id="kinematicsSamplingFrequency" name="kinematicsSamplingFrequency">
            </div>
            <div class="mf-form-group">
                <label for="trackedJoints">Tracked Joints/Markers</label>
                <textarea id="trackedJoints" name="trackedJoints" rows="3"></textarea>
            </div>
        </div>

        <div class="mf-form-group">
            <label>Video Recording Included?</label>
            <div class="mf-radio-group">
                <label>
                    <input type="radio" name="videoIncluded" value="yes">
                    Yes
                </label>
                <label>
                    <input type="radio" name="videoIncluded" value="no">
                    No
                </label>
            </div>
        </div>
    </section>

    <!-- Section 7: Motor Unit Labeling -->
    <section class="form-section" data-section="7">
        <h2>Motor Unit Labeling</h2>

        <div class="mf-form-group">
            <label for="decompositionMethod">Decomposition Method *</label>
            <select id="decompositionMethod" name="decompositionMethod" required>
                <option value="">Select</option>
                <option value="manual">Expert manual annotation</option>
                <option value="semi-automated">Semi-automated (specify algorithm)</option>
                <option value="fully-automated">Fully automated (specify algorithm)</option>
                <option value="two-source">Two-source validation (concurrent iEMG)</option>
                <option value="simulation">Simulation ground truth</option>
            </select>
        </div>

        <div id="experimentalLabelingFields" style="display:none;">
            <div class="mf-form-group">
                <label for="decompositionSoftware">Decomposition Software *</label>
                <input type="text" id="decompositionSoftware" name="decompositionSoftware" placeholder="e.g., DEMUSE, OTBiolab+, Custom">
            </div>

            <div class="mf-form-group">
                <label for="softwareVersion">Software Version</label>
                <input type="text" id="softwareVersion" name="softwareVersion">
            </div>

            <div class="mf-form-group">
                <label>Manual Editing Performed?</label>
                <div class="mf-radio-group">
                    <label>
                        <input type="radio" name="manualEditingPerformed" value="yes">
                        Yes
                    </label>
                    <label>
                        <input type="radio" name="manualEditingPerformed" value="no">
                        No
                    </label>
                </div>
            </div>

            <div class="mf-form-group" id="editingCriteriaGroup" style="display:none;">
                <label for="editingCriteria">Describe Editing Criteria</label>
                <textarea id="editingCriteria" name="editingCriteria" rows="3" maxlength="200"></textarea>
                <small class="char-count">0 / 200 characters</small>
            </div>

            <h3>Quality Thresholds Applied</h3>

            <div class="mf-form-group">
                <label for="minPNR">Minimum Pulse-to-Noise Ratio (dB)</label>
                <input type="number" id="minPNR" name="minPNR" step="0.1">
            </div>

            <div class="mf-form-group">
                <label for="minSilhouette">Minimum Silhouette Score (0-1)</label>
                <input type="number" id="minSilhouette" name="minSilhouette" step="0.01" min="0" max="1">
            </div>

            <div class="mf-form-group">
                <label for="maxCoVISI">Maximum CoV-ISI (0-1)</label>
                <input type="number" id="maxCoVISI" name="maxCoVISI" step="0.01" min="0" max="1">
            </div>

            <div class="mf-form-group">
                <label for="minSpikes">Minimum Number of Spikes</label>
                <input type="number" id="minSpikes" name="minSpikes" min="1">
            </div>
        </div>

        <div class="mf-form-group">
            <label for="numMotorUnits">Total Number of Motor Units Identified *</label>
            <input type="number" id="numMotorUnits" name="numMotorUnits" min="1" required>
            <small>Across all recordings in this dataset</small>
        </div>
    </section>

    <!-- Section 8: Synthetic Data (conditional — shown only for synthetic data types) -->
    <section class="form-section" data-section="8" id="syntheticDataSection" style="display:none;">
        <h2>Synthetic Data Details</h2>

        <div class="mf-form-group">
            <label for="simulationSoftware">Simulation Software *</label>
            <input type="text" id="simulationSoftware" name="simulationSoftware">
        </div>

        <div class="mf-form-group">
            <label for="simulationMethod">Simulation Method *</label>
            <textarea id="simulationMethod" name="simulationMethod" rows="4" maxlength="500"></textarea>
            <small class="char-count">0 / 500 characters</small>
        </div>

        <h3>Motor Neuron Pool Model</h3>

        <div class="mf-form-group">
            <label for="numMotorUnitsSimulated">Number of Motor Units Simulated</label>
            <input type="number" id="numMotorUnitsSimulated" name="numMotorUnitsSimulated">
        </div>

        <div class="mf-form-group">
            <label for="recruitmentModel">Recruitment Model</label>
            <input type="text" id="recruitmentModel" name="recruitmentModel" placeholder="e.g., size principle, Fuglevand">
        </div>

        <div class="mf-form-group">
            <label for="rateCodingModel">Rate Coding Model</label>
            <input type="text" id="rateCodingModel" name="rateCodingModel">
        </div>

        <h3>Volume Conductor Model</h3>

        <div class="mf-form-group">
            <label for="tissueLayers">Tissue Layers</label>
            <input type="text" id="tissueLayers" name="tissueLayers" placeholder="e.g., muscle, fat, skin">
        </div>

        <div class="mf-form-group">
            <label for="conductivityValues">Conductivity Values</label>
            <input type="text" id="conductivityValues" name="conductivityValues">
        </div>

        <h3>Noise Model</h3>

        <div class="mf-form-group">
            <label>Noise Types (check all that apply)</label>
            <div class="mf-checkbox-group">
                <label>
                    <input type="checkbox" name="noiseThermal">
                    Thermal noise
                </label>
                <label>
                    <input type="checkbox" name="noiseMotion">
                    Motion artifact
                </label>
                <label>
                    <input type="checkbox" name="noiseCrosstalk">
                    Crosstalk
                </label>
            </div>
        </div>

        <div class="mf-form-group">
            <label for="snrRange">SNR Range</label>
            <input type="text" id="snrRange" name="snrRange" placeholder="e.g., 20-40 dB">
        </div>
    </section>

    <!-- Section 9: Review & Download -->
    <section class="form-section" data-section="9">
        <h2>Review &amp; Download</h2>

        <div class="mf-review-container">
            <h3>Dataset Summary</h3>
            <div id="reviewSummary"></div>

            <h3>Generated BIDS Metadata Preview</h3>
            <pre id="bidsDatasetPreview" class="mf-json-preview">{}</pre>
            <pre id="bidsSubjectsPreview" class="mf-json-preview">{}</pre>
            <pre id="bidsEMGPreview" class="mf-json-preview">{}</pre>
        </div>

        <div class="mf-form-group">
            <div class="mf-checkbox-group">
                <label class="mf-checkbox-label">
                    <input type="checkbox" name="confirmEthics" required>
                    I confirm this dataset has ethics approval *
                </label>
                <label class="mf-checkbox-label">
                    <input type="checkbox" name="confirmAnonymization" required>
                    I confirm all personal data is anonymized *
                </label>
                <label class="mf-checkbox-label">
                    <input type="checkbox" name="confirmLicense" required>
                    I agree to license this data under the selected license *
                </label>
                <label class="mf-checkbox-label">
                    <input type="checkbox" name="confirmResubmission" required>
                    I understand I can resubmit up to 3 times *
                </label>
            </div>
        </div>

        <div class="mf-submission-status" id="submissionStatus" style="display:none;"></div>
    </section>

    <!-- Navigation Buttons -->
    <div class="mf-form-navigation">
        <button type="button" class="mf-btn-secondary" id="prevBtn" onclick="navigateForm(-1)" style="display:none;">Previous</button>
        <button type="button" class="mf-btn-secondary" id="saveDraftBtn" onclick="saveDraft()">Save Draft</button>
        <button type="button" class="mf-btn-primary" id="nextBtn" onclick="navigateForm(1)">Next</button>
        <button type="button" class="mf-btn-primary" id="downloadBtn" style="display:none;">Download metadata.json</button>
    </div>

</form>
</div>

<script src="/assets/js/metadata-form.js"></script>
