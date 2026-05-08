---
title: Metadata Form
feature_image: "/Images/header.jpeg"
layout: page
---

<p>Fill in the fields below to describe your dataset. When you reach the final step, click <strong>Download metadata.zip</strong> — a ZIP file containing all metadata files will be saved to your computer. Upload this file alongside your data ZIP to the shared drive. Your progress is saved automatically in your browser.</p>

<div class="metadata-form">

<div class="mf-progress-bar">
    <div class="mf-progress-step active" data-step="1">
        <div class="mf-step-number">1</div>
        <div class="mf-step-label">Data Type</div>
    </div>
    <div class="mf-progress-step" data-step="2">
        <div class="mf-step-number">2</div>
        <div class="mf-step-label">Dataset Info</div>
    </div>
    <div class="mf-progress-step" data-step="3">
        <div class="mf-step-number">3</div>
        <div class="mf-step-label">Participants</div>
    </div>
    <div class="mf-progress-step" data-step="4">
        <div class="mf-step-number">4</div>
        <div class="mf-step-label">Recording</div>
    </div>
    <div class="mf-progress-step" data-step="5">
        <div class="mf-step-number">5</div>
        <div class="mf-step-label">Task Protocol</div>
    </div>
    <div class="mf-progress-step" data-step="6">
        <div class="mf-step-number">6</div>
        <div class="mf-step-label">Labeling</div>
    </div>
    <div class="mf-progress-step" data-step="7">
        <div class="mf-step-number">7</div>
        <div class="mf-step-label">Review</div>
    </div>
</div>

<form id="submissionForm" class="mf-submission-form">

    <!-- Section 1: Data Type Selection -->
    <section class="form-section active" data-section="1">
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

        <!-- Synthetic details — shown inline when a synthetic type is selected -->
        <div id="syntheticDataSection" style="display:none;">
            <h3>Synthetic Data Details</h3>

            <div class="mf-form-group">
                <label>Software pipeline(s) used to generate the dataset <span id="pipelineRequiredMark" style="display:none;">*</span></label>
                <small>Add one entry per pipeline step, in processing order.</small>
                <div id="syntheticPipelineList"></div>
                <button type="button" class="mf-btn-secondary" onclick="addSyntheticPipeline()">
                    + Add Pipeline
                </button>
            </div>

            <div class="mf-form-group">
                <label>Source Datasets</label>
                <small>Datasets from which any experimental data (e.g., MUAPs) were derived.</small>
                <div id="sourceDatasetList"></div>
                <button type="button" class="mf-btn-secondary" onclick="addSourceDataset()">
                    + Add Source Dataset
                </button>
            </div>
        </div>
    </section>

    <!-- Section 2: General Dataset Metadata -->
    <section class="form-section" data-section="2">
        <h2>General Dataset Metadata</h2>

        <div class="mf-form-group">
            <label for="datasetName">Dataset Name *</label>
            <input type="text" id="datasetName" name="datasetName" required>
            <small>Short identifier used as the root folder name (e.g., "TibAnt_Isometric_2025")</small>
        </div>

        <div class="mf-form-group">
            <label for="datasetDescription">Dataset Description</label>
            <textarea id="datasetDescription" name="datasetDescription" rows="4" maxlength="500"></textarea>
            <small class="char-count">0 / 500 characters</small>
        </div>

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

    <!-- Section 3: Participant Information -->
    <section class="form-section" data-section="3">
        <h2>Participant Information</h2>

        <div class="mf-form-group">
            <label>Step 1 — Download the template and fill it in</label>
            <div style="display:flex; align-items:center; gap:10px;">
                <span>template_participants.csv</span>
                <a href="/assets/files/template_participants.csv" download title="Download template" style="color:var(--mf-text-muted); line-height:0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
            </div>
            <small>Columns: <code>participant_id, sex, age, height, weight, handedness, group</code></small>
        </div>

        <div class="mf-form-group">
            <label for="participantsFile">Step 2 — Upload your completed file *</label>
            <input type="file" id="participantsFile" name="participantsFile" accept=".csv"
                onchange="handleParticipantsUpload(this)">
            <div id="participantsValidationMsg"></div>
        </div>

    </section>

    <!-- Section 4: Recording Information -->
    <section class="form-section" data-section="4">
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

        <h3>Preparation</h3>

        <div class="mf-form-group">
            <label for="skinPreparation">Skin Preparation</label>
            <input type="text" id="skinPreparation" name="skinPreparation" placeholder="Method used to precondition the skin.">
        </div>

        <div class="mf-form-group">
            <label for="placementSchemeDescription">EMG Placement Scheme Description</label>
            <input type="text" id="placementSchemeDescription" name="placementSchemeDescription" placeholder="Free text describing the method used to position your grids.">
        </div>

        <h3>Coordinate systems</h3>

        <div class="mf-form-group">
            <label>Coordinates</label>
            <div id="coordList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addCoord('coordList')">
                + Add Coordinate System
            </button>
        </div>

        <h3>Electrode Configuration</h3>

        <div class="mf-form-group">
            <label>Reference and Ground Electrodes</label>
            <div id="refElectrodeList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addRefElectrode('refElectrodeList')">
                + Add Reference Electrode
            </button>
        </div> 

        <div class="mf-form-group">
            <label>Surface EMG</label>
            <div id="surfaceEMGList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addSurfaceEMG('surfaceEMGList')">
                + Add surface Electrode
            </button>
        </div> 

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

        <div class="mf-form-group">
            <label>MISC Channels</label>
            <div id="miscList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addMISC('miscList')">
                + Add MISC
            </button>
        </div>   

    </section>

    <!-- Section 5: Task & Protocol Information -->
    <section class="form-section" data-section="5">
 
        <h2>Task &amp; Protocol Information</h2>

        <div class="mf-form-group">
            <label>Task</label>
            <div id="taskList"></div>

            <button type="button" class="mf-btn-secondary" onclick="addTask('taskList')">
                + Add Task
            </button>
        </div> 

    </section>

    <!-- Section 6: Motor Unit Labeling -->
    <section class="form-section" data-section="6">
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

    <!-- Section 7: Review & Download -->
    <section class="form-section" data-section="7">
        <h2>Review &amp; Download</h2>

        <div class="mf-review-container">
            <h3>Dataset Summary</h3>
            <div id="reviewSummary"></div>

            <h3>Generated BIDS Metadata Preview</h3>
            <pre id="bidsDatasetPreview" class="mf-json-preview">{}</pre>
            <pre id="bidsSubjectsPreview" class="mf-json-preview">{}</pre>
            <pre id="bidsEMGPreview" class="mf-json-preview">{}</pre>
            <pre id="bidsChannelsPreview" class="mf-json-preview">{}</pre>
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
        <button type="button" class="mf-btn-primary" id="downloadBtn" style="display:none;">Download metadata.zip</button>
    </div>

</form>
</div>

<script src="/assets/js/metadata-form.js"></script>
