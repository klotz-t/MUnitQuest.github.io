// MUnitQuest Metadata Form - Client-side JSON download

// Global variables
let currentSection = 1;
const totalSections = 9; // sections 1-8 + review (was 10, removed upload section 9)
let sectionMap = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // logical section -> data-section attribute
// section 8 (synthetic) is conditional; section 9 in HTML = review

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    loadDraft();
    setupEventListeners();
    updateNavigation();
});

function initializeForm() {
    showSection(1);
    setInterval(autoSave, 30000);
    window.addEventListener('beforeunload', function(e) {
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

function setupEventListeners() {
    // Character counters
    document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
        textarea.addEventListener('input', updateCharCount);
        updateCharCount.call(textarea);
    });

    // Data type selection - show/hide synthetic section
    document.querySelectorAll('input[name="dataType"]').forEach(radio => {
        radio.addEventListener('change', handleDataTypeChange);
    });

    // License selection - show "other" field
    document.getElementById('license').addEventListener('change', function() {
        document.getElementById('otherLicenseGroup').style.display =
            this.value === 'other' ? 'block' : 'none';
    });

    // Health status - show pathological conditions
    document.querySelectorAll('input[name="healthStatus"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('pathologicalConditionsGroup').style.display =
                (this.value === 'pathological' || this.value === 'mixed') ? 'block' : 'none';
        });
    });

    // Contraction type - show/hide specific fields
    ['contractionIsometric', 'contractionConcentric', 'contractionEccentric', 'contractionMixed'].forEach(id => {
        document.getElementById(id).addEventListener('change', toggleContractionFields);
    });

    // Force data - show/hide fields
    document.querySelectorAll('input[name="forceDataIncluded"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('forceDataFields').style.display =
                this.value === 'yes' ? 'block' : 'none';
        });
    });

    // Kinematics data - show/hide fields
    document.querySelectorAll('input[name="kinematicsDataIncluded"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('kinematicsDataFields').style.display =
                this.value === 'yes' ? 'block' : 'none';
        });
    });

    // Decomposition method - show/hide experimental fields
    document.getElementById('decompositionMethod').addEventListener('change', function() {
        document.getElementById('experimentalLabelingFields').style.display =
            (this.value !== 'simulation') ? 'block' : 'none';
    });

    // Manual editing - show/hide criteria
    document.querySelectorAll('input[name="manualEditingPerformed"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('editingCriteriaGroup').style.display =
                this.value === 'yes' ? 'block' : 'none';
        });
    });

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', handleDownload);
}

// Character counter
function updateCharCount() {
    const maxLength = this.getAttribute('maxlength');
    const counter = this.parentElement.querySelector('.char-count');
    if (counter) {
        counter.textContent = `${this.value.length} / ${maxLength} characters`;
    }
}

// Handle data type change - show/hide synthetic section in progress bar + navigation
function handleDataTypeChange() {
    const selectedType = document.querySelector('input[name="dataType"]:checked').value;
    const syntheticSection = document.getElementById('syntheticDataSection');
    syntheticSection.style.display = selectedType.startsWith('synthetic') ? 'block' : 'none';
}

function toggleContractionFields() {
    const isometric = document.getElementById('contractionIsometric').checked;
    const dynamic = document.getElementById('contractionConcentric').checked ||
                    document.getElementById('contractionEccentric').checked ||
                    document.getElementById('contractionMixed').checked;

    document.getElementById('isometricFields').style.display = isometric ? 'block' : 'none';
    document.getElementById('dynamicFields').style.display = dynamic ? 'block' : 'none';
}

// Generic list generator
function addListItem(containerId, schema, className, title = null) {
    const container = document.getElementById(containerId);

    const entry = document.createElement("div");
    entry.className = className;

    let html = "";

    if (title) {
        html += `<div class="mf-subject-header">${title}</div>`;
    }

    html += `<div class="mf-fields">`;

    schema.forEach(field => {

        const dependsAttr = field.dependsOn
            ? `data-depends-field="${field.dependsOn.field}"
            data-depends-value='${JSON.stringify(field.dependsOn.values || field.dependsOn.value)}'`
            : "";

        if (field.type === "select") {
            html += `
                <div class="mf-field-row" data-field="${field.name}" ${dependsAttr}>
                    <select name="${field.name}[]">
                        ${field.options.map(opt => `
                            <option value="${opt}">${opt}</option>
                        `).join("")}
                    </select>
                </div>
            `;
        } else {
            html += `
                <div class="mf-field-row" data-field="${field.name}" ${dependsAttr}>
                    <input type="${field.type}"
                        name="${field.name}[]"
                        placeholder="${field.placeholder || ""}">
                </div>
            `;
        }
    });

    html += `
        <button type="button" class="mf-btn-remove" onclick="this.parentElement.parentElement.remove()">
            Remove
        </button>
    </div>`;

    entry.innerHTML = html;
    container.appendChild(entry);
    setupConditionalFields(entry);
}

// Conditional fields
function setupConditionalFields(entry) {

    const allFields = entry.querySelectorAll("[data-field]");

    function update() {
        allFields.forEach(fieldRow => {

            const dependsField = fieldRow.dataset.dependsField;
            const dependsValue = fieldRow.dataset.dependsValue;

            if (!dependsField) return;

            const controller = entry.querySelector(`[name="${dependsField}[]"]`);
            if (!controller) return;

            // 🔥 NEW: support multiple values
            let isVisible = false;

            try {
                const allowed = JSON.parse(dependsValue);

                if (Array.isArray(allowed)) {
                    isVisible = allowed.includes(controller.value);
                } else {
                    isVisible = controller.value === dependsValue;
                }
            } catch {
                // fallback for single value
                isVisible = controller.value === dependsValue;
            }

            fieldRow.style.display = isVisible ? "flex" : "none";

            const input = fieldRow.querySelector("input, select");
            if (input) input.disabled = !isVisible;
        });
    }

    entry.querySelectorAll("select, input").forEach(el => {
        el.addEventListener("change", update);
    });

    update();
}

// Authors management
const authorSchema = [
    { name: "author", type: "text", placeholder: "LastName, FirstName" }
];

function addAuthor() {
    addListItem("authorsList", authorSchema, "author-entry");
}

// Ethics approvals
const ethicsSchema = [
    { name: "ethics", type: "text", placeholder: "Institution (Approval ID)" }
];

function addEthics() {
    addListItem("ethicsList", ethicsSchema, "ethics-entry");
}

// Funding sources
const fundingSchema = [
    { name: "funding", type: "text", placeholder: "Funding agency (Grant ID)" }
];

function addFunding() {
    addListItem("fundingList", fundingSchema, "funding-entry");
}

// Funding sources
const referenceSchema = [
    { name: "reference", type: "text", placeholder: "e.g., your publication related to the dataset" }
];

function addReference() {
    addListItem("referencesList", referenceSchema, "reference-entry");
}

// Subjects management
const subjectSchema = [
    { name: "participant_id", type: "text", placeholder: "Unique subject ID, e.g., 01" },
    { name: "sex", type: "select", options: ["female", "male", "other", "n/a"]},
    { name: "age", type: "number", placeholder: "Age in years" },
    { name: "height", type: "number", placeholder: "Height in cm" },
    { name: "weight", type: "number", placeholder: "Weight in kg" },
    { name: "handedness", type: "select", options: ["left handedness", "right handedness", "n/a"]},
    { name: "group", type: "text", placeholder: "Experimentale.g., patients or controls"}
];

function addSubject() {
    addListItem("subjectsList", subjectSchema, "mf-subject-entry", "Subject");
}

// Coordinate systems
const coordSchema = [
    { name: "type", type: "select", options: ["anatomical", "grid"], placeholder: "Coordinate system type"},
    { name: "name", type: "text", placeholder: "Coordinate system name, e.g., lowerLeg or grid1" },
    { name: "description", type: "text" , placeholder: "Describes origin and positive axis directions relative to anatomical landmarks."},
    { name: "units", type: "select", options: ["m", "cm", "mm", "percent", "n/a"], placeholder: "Unit"},

    { name: "parent", type: "text", dependsOn: { field: "type", value: ["grid"] }, placeholder: "The name of the parent (anatomical) coordinate system"},
    { name: "anchor_coords", type: "text", dependsOn: { field: "type", value: ["grid"] }, placeholder: "Coordinates of the AnchorElectrode" },
    { name: "anchor_electrode", type: "text", dependsOn: { field: "type", value: ["grid"] }, placeholder: "Name of the AnchorElectrode" }
];

function addCoord() {
    addListItem("coordList", coordSchema, "mf-misc-entry", "coord_systems");
}

// MISC channels
const miscSchema = [
    { name: "name", type: "text", placeholder: "None EMG channels, e.g., torque or requested task profile" },
    { name: "units", type: "select", options: ["V", "mV", "uV", "percent MVC", "percent MVC / s", "N", "Nm", "m", "m/s", "m/s^2", "other", "n/a"], placeholder: "Unit of the measurement, e.g., V or % MVC"},
    { name: "myunits", type: "text", dependsOn: {field: "units", value: ["other"]}, placeholder: "Add your unit"}
];

function addMISC() {
    addListItem("miscList", miscSchema, "mf-misc-entry", "MISC");
}

// HDsEMG arrays
const refElectrodeSchema = [
    { name: "name", type: "text", placeholder: "Unique electrode name, e.g. R1"},
    { name: "type", type: "select", options: ["band", "ring", "other"]},
    { name: "mytype", type: "text", dependsOn: { field: "type", value: ["other"]}, placeholder: "Specify the type of your electrode"} ,
    { name: "manufacturer", type: "text", placeholder: "Electrode manufacturer, e.g., OTBioelettronica" },
    { name: "manufacturersModelName", type: "text", placeholder: "Manufacturer's model name, e.g., GR04MM1305"},
    { name: "material", type: "text", placeholder: "Electrode material, e.g., textile"},
    { name: "coord_system", type: "text", placeholder: "Coordinate system used to describe elecrode position, e.g., lowerLeg"},
    { name: "x", type: "number", placeholder: "x coordinate"},
    { name: "y", type: "number", placeholder: "y coordinate"},
    { name: "z", type: "number", placeholder: "z coordinate"}
];

function addRefElectrode() {
    addListItem("refElectrodeList", refElectrodeSchema, "mf-misc-entry", "refElectrodes");
}

// HDsEMG arrays
const surfaceEMGSchema = [
    { name: "name", type: "text", placeholder: "Unique electrode name, e.g. grid1"},
    { name: "montage", type: "select", options: ["monopolar", "bipolar"]},
    { name: "manufacturer", type: "text", placeholder: "Electrode manufacturer, e.g., OTBioelettronica" },
    { name: "manufacturersModelName", type: "text", placeholder: "Manufacturer's model name, e.g., GR04MM1305"},
    { name: "interelectrode_distance", type: "number", min: 0, step:0.1, placeholder: "Interelectrode distance in mm"},
    { name: "numChannels", type: "number", min:1, step:1, placeholder: "Number of channels in that grid"},
    { name: "material", type: "text", placeholder: "Electrode material, e.g., gold or Ag/AgCl"},
    { name: "targetMuscle", type: "text", placeholder: "Muscle (or muscle group) the electrode records from, e.g., right tibialis anterior"},
    { name: "lowCutOff", type: "number", placeholder: "Cut-off frequency of the low pass filter in Hz"},
    { name: "highCutOff", type: "number", placeholder: "Cut-off frequency of the high pass filter in Hz"},
    { name: "reference", type: "text", dependsOn: { field: "montage", value: ["monopolar"]}, placeholder: "Name of the electrode used for referencing"},
    { name: "coord_system", type: "text", placeholder: "Coordinate system used to describe elecrode position, e.g., grid1"},
    { name: "x", type: "text", placeholder: "list of x coordinates, e.g. 0, 4, 8, 12, 12, 8, 4, 0"},
    { name: "y", type: "text", placeholder: "list of y coordinates, e.g. 0, 0, 0, 0, 4, 4, 4, 4"},
    { name: "z", type: "text", placeholder: "list of z coordinates, or n/a"}
];

function addSurfaceEMG() {
    addListItem("surfaceEMGList", surfaceEMGSchema, "mf-misc-entry", "surfaceEMG");
}


// Get the list of visible section numbers (data-section attributes) for navigation
function getVisibleSections() {
    const syntheticSelected = document.querySelector('input[name="dataType"]:checked');
    const isSynthetic = syntheticSelected && syntheticSelected.value.startsWith('synthetic');
    // data-section values in the HTML: 1,2,3,4,5,6,7,8(synthetic),9(review)
    // Section 8 (synthetic) is only shown if synthetic data type selected
    const sections = [1, 2, 3, 4, 5, 6, 7];
    if (isSynthetic) sections.push(8);
    sections.push(9); // review is always last
    return sections;
}

// Form navigation
function navigateForm(direction) {
    if (direction === 1 && !validateSection(currentSection)) {
        return;
    }

    const visible = getVisibleSections();
    const idx = visible.indexOf(currentSection);
    const newIdx = idx + direction;

    if (newIdx >= 0 && newIdx < visible.length) {
        showSection(visible[newIdx]);
    }
}

function showSection(sectionNumber) {
    document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
    const target = document.querySelector(`.form-section[data-section="${sectionNumber}"]`);
    if (target) {
        target.classList.add('active');
        currentSection = sectionNumber;
        updateProgressBar();
        updateNavigation();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (sectionNumber === 9) {
            generateReview();
        }
    }
}

function updateProgressBar() {
    const visible = getVisibleSections();
    const currentIdx = visible.indexOf(currentSection); // 0-based position

    document.querySelectorAll('.mf-progress-step').forEach((step, index) => {
        // Progress steps are always 1..N in order; map them to visible sections
        if (index < currentIdx) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index === currentIdx) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

function updateNavigation() {
    const visible = getVisibleSections();
    const idx = visible.indexOf(currentSection);
    const isFirst = idx === 0;
    const isLast = idx === visible.length - 1;

    document.getElementById('prevBtn').style.display = isFirst ? 'none' : 'inline-block';
    document.getElementById('nextBtn').style.display = isLast ? 'none' : 'inline-block';
    document.getElementById('downloadBtn').style.display = isLast ? 'inline-block' : 'none';
}

// Validation
function validateSection(sectionNumber) {
    const section = document.querySelector(`.form-section[data-section="${sectionNumber}"]`);
    const inputs = section.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    for (const input of inputs) {
        if (!input.checkValidity()) {
            isValid = false;
            input.reportValidity();
            break;
        }
    }

    if (sectionNumber === 2) {
        if (!document.querySelector('input[name="dataType"]:checked')) {
            alert('Please select a data type');
            return false;
        }
    }

    if (sectionNumber === 6) {
        const contractionChecked = document.querySelector(
            '#contractionIsometric:checked, #contractionConcentric:checked, #contractionEccentric:checked, #contractionMixed:checked'
        );
        if (!contractionChecked) {
            alert('Please select at least one contraction type');
            return false;
        }
    }

    return isValid;
}

// Generate review summary
function generateReview() {
    const data = getFormData();
    const reviewSummary = document.getElementById('reviewSummary');

    let html = '<h4>Dataset Information</h4>';
    html += `<p><strong>Team:</strong> ${data.teamName || 'N/A'}</p>`;
    html += `<p><strong>Dataset:</strong> ${data.datasetName || 'N/A'}</p>`;
    html += `<p><strong>Data Type:</strong> ${data.dataType || 'N/A'}</p>`;

    html += '<h4>Recording Details</h4>';
    html += `<p><strong>Participants:</strong> ${data.numParticipants || 'N/A'}</p>`;
    html += `<p><strong>EMG Channels:</strong> ${data.emgChannelCount || 'N/A'}</p>`;
    html += `<p><strong>Sampling Frequency:</strong> ${data.samplingFrequency || 'N/A'} Hz</p>`;
    html += `<p><strong>Manufacturer:</strong> ${data.manufacturer || 'N/A'} ${data.manufacturerModel || ''}</p>`;

    html += '<h4>Task Information</h4>';
    html += `<p><strong>Task Name:</strong> ${data.taskName || 'N/A'}</p>`;
    html += `<p><strong>Number of Trials:</strong> ${data.numTrials || 'N/A'}</p>`;

    html += '<h4>Motor Units</h4>';
    html += `<p><strong>Total Motor Units:</strong> ${data.numMotorUnits || 'N/A'}</p>`;
    html += `<p><strong>Decomposition Method:</strong> ${data.decompositionMethod || 'N/A'}</p>`;

    reviewSummary.innerHTML = html;
    getBIDS_datasetJson(data);
    getBIDS_subjectsTSV(data);
    getBIDS_emgJson(data);
    generateChannelsTSV(data);
}

function getBIDS_datasetJson(data) {
    const bids = {
        "Name": data.datasetName || "",
        "BIDSVersion": "1.11.1",
        "DatasetType": "raw",
        "License": data.license || "",
        "Authors": getArrayField("author", { emptyValue: "" }),
        "Acknowledgements": data.fundingSources || "",
        "Funding": getArrayField("funding", { emptyValue: "" }),
        "ReferencesAndLinks": getArrayField("reference", { emptyValue: "" }),
        "EthicsApprovals": getArrayField("ethics", { emptyValue: "" }),
        "InstitutionName": data.institutionName || "",
        "InstitutionAddress": data.institutionAddress || "",
        "GeneratedBy": [
            {
                "Name": "MUnitQuest BIDS-Tools",
                "Version": "0.1.0",
                "Description": "Assisted manual metadata annotaion"
            }
        ],
    };
    document.getElementById('bidsDatasetPreview').textContent = JSON.stringify(bids, null, 2);
}

function getBIDS_emgJson(data) {
    const bids = {
        "TaskName": data.taskName || "n/a",
        "TaskDescription": data.taskDescription || "n/a",
        "Manufacturer": data.manufacturer || "n/a",
        "ManufacturersModelName": data.manufacturerModel || "n/a",
        "SamplingFrequency": parseFloat(data.samplingFrequency) || "n/a",
        "PowerLineFrequency": parseFloat(data.powerLineFrequency) || "n/a",
        "HardwareFilters": {
            "HighPassFilter":  parseFloat(data.highPassFilter) || "n/a",
            "LowPassFilter":  parseFloat(data.lowPassFilter) || "n/a"
        },
        "EMGChannelCount": parseInt(data.emgChannelCount) || null,
        "EMGReference": data.emgReference || "n/a",
        "EMGGround": data.emgGround || "n/a"
    };
    document.getElementById('bidsEMGPreview').textContent = JSON.stringify(bids, null, 2);
}

function getBIDS_subjectsTSV(data) {
    const participant_id = data.participant_id || [];
    const ages = data.subjects_age || [];
    const heights = data.subjects_height || [];
    const weights = data.subjects_weight || [];

    const length = Math.max(participant_id.length, ages.length, heights.length, weights.length);
    //const length = Math.max(ages.length, heights.length, weights.length);

    const subjects = [];

    for (let i = 0; i < length; i++) {
        subjects.push({
            participant_id: `sub-${participant_id[i]}` || "",
            //participant_id: `sub-${String(i + 1).padStart(2, "0")}`,
            age: ages[i] || "n/a",
            height: heights[i] || "n/a",
            weight: weights[i] || "n/a"
        });
    }

    let tsv = "participant_id\tage\theight\tweight\n";

    subjects.forEach((s, index) => {
        tsv += [
            s.participant_id,
            s.age,
            s.height,
            s.weight
        ].join("\t") + "\n";
    });

    document.getElementById('bidsSubjectsPreview').textContent = tsv;
}

// Collect all form data from an array field
function getArrayField(fieldName, { emptyValue = "n/a" } = {}) {
    return Array.from(document.querySelectorAll(`[name="${fieldName}[]"]`))
        .map(el => {
            const val = el.value?.trim?.() ?? el.value;
            return val ? val : emptyValue;
        });
}

// Collect all form data into a plain object
function getFormData() {
    const form = document.getElementById('submissionForm');
    const fd = new FormData(form);
    const data = {};

    for (let [key, value] of fd.entries()) {
        if (key.endsWith('[]')) {
            const arrayKey = key.slice(0, -2);
            if (!data[arrayKey]) data[arrayKey] = [];
            data[arrayKey].push(value);
        } else {
            data[key] = value;
        }
    }
    return data;
}

// Build the full metadata object for download
function buildMetadata() {
    const data = getFormData();
    return {
        submissionInfo: {
            teamName: data.teamName || "",
            teamLeaderName: data.teamLeaderName || "",
            teamLeaderEmail: data.teamLeaderEmail || "",
            submittedAt: new Date().toISOString()
        },
        dataset: {
            name: data.datasetName || "",
            description: data.datasetDescription || "",
            dataType: data.dataType || "",
            license: data.license === 'other' ? (data.otherLicense || "") : (data.license || ""),
            authors: getAuthors(),
            fundingSources: data.fundingSources || "",
            ethicsApprovalNumber: data.ethicsApprovalNumber || "",
            ethicsCommittee: data.ethicsCommittee || "",
            institutionName: data.institutionName || "",
            institutionAddress: data.institutionAddress || ""
        },
        participants: {
            numParticipants: parseInt(data.numParticipants) || null,
            ageMin: parseInt(data.ageMin) || null,
            ageMax: parseInt(data.ageMax) || null,
            sexFemale: data.sexFemale === 'on',
            femaleCount: parseInt(data.femaleCount) || null,
            sexMale: data.sexMale === 'on',
            maleCount: parseInt(data.maleCount) || null,
            sexOther: data.sexOther === 'on',
            otherCount: parseInt(data.otherCount) || null,
            healthStatus: data.healthStatus || "",
            pathologicalConditions: data.pathologicalConditions || ""
        },
        recording: {
            manufacturer: data.manufacturer || "n/a",
            manufacturerModel: data.manufacturerModel || "n/a",
            samplingFrequency: parseFloat(data.samplingFrequency) || null,
            powerLineFrequency: data.powerLineFrequency || "n/a",
            hardwareFilters: data.hardwareFilters || "n/a",
            lowPassFilter: data.lowPassFilter || "n/a",
            lowPassFilter: data.highPassFilter || "n/a",
            recordingDuration: parseFloat(data.recordingDuration) || null,
            emgChannelCount: parseInt(data.emgChannelCount) || null,
            electrodeMaterial: data.electrodeMaterial || "n/a",
            electrodeShape: data.electrodeShape || "n/a",
            electrodeDiameter: parseFloat(data.electrodeDiameter) || null,
            interElectrodeDistance: parseFloat(data.interElectrodeDistance) || null,
            electrodeArrayType: data.electrodeArrayType || "n/a",
            electrodePlacement: data.electrodePlacement || "n/a",
            emgReference: data.emgReference || "n/a",
            emgGround: data.emgGround || "n/a"
        },
        task: {
            taskName: data.taskName || "",
            taskDescription: data.taskDescription || "",
            instructions: data.instructions || "",
            contractionIsometric: data.contractionIsometric === 'on',
            contractionConcentric: data.contractionConcentric === 'on',
            contractionEccentric: data.contractionEccentric === 'on',
            contractionMixed: data.contractionMixed === 'on',
            targetForceLevels: data.targetForceLevels || "",
            contractionDuration: parseFloat(data.contractionDuration) || null,
            restDuration: parseFloat(data.restDuration) || null,
            jointROM: data.jointROM || "",
            movementSpeed: data.movementSpeed || "",
            loadType: data.loadType || "",
            numTrials: parseInt(data.numTrials) || null,
            forceDataIncluded: data.forceDataIncluded || "",
            forceSensorType: data.forceSensorType || "",
            forceSamplingFrequency: parseFloat(data.forceSamplingFrequency) || null,
            forceUnits: data.forceUnits || "",
            kinematicsDataIncluded: data.kinematicsDataIncluded || "",
            motionCaptureSystem: data.motionCaptureSystem || "",
            kinematicsSamplingFrequency: parseFloat(data.kinematicsSamplingFrequency) || null,
            trackedJoints: data.trackedJoints || "",
            videoIncluded: data.videoIncluded || ""
        },
        labeling: {
            decompositionMethod: data.decompositionMethod || "",
            decompositionSoftware: data.decompositionSoftware || "",
            softwareVersion: data.softwareVersion || "",
            manualEditingPerformed: data.manualEditingPerformed || "",
            editingCriteria: data.editingCriteria || "",
            minPNR: parseFloat(data.minPNR) || null,
            minSilhouette: parseFloat(data.minSilhouette) || null,
            maxCoVISI: parseFloat(data.maxCoVISI) || null,
            minSpikes: parseInt(data.minSpikes) || null,
            numMotorUnits: parseInt(data.numMotorUnits) || null
        },
        synthetic: (data.dataType || "").startsWith('synthetic') ? {
            simulationSoftware: data.simulationSoftware || "",
            simulationMethod: data.simulationMethod || "",
            numMotorUnitsSimulated: parseInt(data.numMotorUnitsSimulated) || null,
            recruitmentModel: data.recruitmentModel || "",
            rateCodingModel: data.rateCodingModel || "",
            tissueLayers: data.tissueLayers || "",
            conductivityValues: data.conductivityValues || "",
            noiseThermal: data.noiseThermal === 'on',
            noiseMotion: data.noiseMotion === 'on',
            noiseCrosstalk: data.noiseCrosstalk === 'on',
            snrRange: data.snrRange || ""
        } : null,
        bidsDatasetDescription: {
            Name: data.datasetName || "",
            BIDSVersion: "1.10.1",
            DatasetType: "raw",
            License: data.license === 'other' ? (data.otherLicense || "") : (data.license || ""),
            Authors: getAuthors(),
            Funding: data.fundingSources ? [data.fundingSources] : [],
            EthicsApprovals: [data.ethicsApprovalNumber || ""],
            InstitutionName: data.institutionName || "",
            TaskName: data.taskName || "",
            Manufacturer: data.manufacturer || "",
            ManufacturersModelName: data.manufacturerModel || "",
            SamplingFrequency: parseFloat(data.samplingFrequency) || null,
            PowerLineFrequency: data.powerLineFrequency || "",
            HardwareFilters: data.hardwareFilters || "",
            EMGChannelCount: parseInt(data.emgChannelCount) || null,
            EMGReference: data.emgReference || "",
            EMGGround: data.emgGround || ""
        }
    };
}

// Download metadata as JSON
function downloadMetadata(metadata) {
    const teamName = (metadata.submissionInfo.teamName || 'metadata').replace(/[^a-zA-Z0-9_-]/g, '_');
    const json = JSON.stringify(metadata, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${teamName}_metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

function handleDownload(e) {
    e.preventDefault();

    if (!validateSection(currentSection)) {
        return;
    }

    const metadata = buildMetadata();
    downloadMetadata(metadata);

    // Show success message
    const statusDiv = document.getElementById('submissionStatus');
    statusDiv.className = 'mf-submission-status mf-success';
    statusDiv.innerHTML = `
        <strong>metadata.json downloaded!</strong><br>
        Upload this file alongside your data ZIP to the shared drive.
    `;
    statusDiv.style.display = 'block';

    // Clear draft
    localStorage.removeItem('munitquest_draft');
    localStorage.removeItem('munitquest_draft_section');
}

// Save and load draft
function saveDraft() {
    const data = getFormData();
    localStorage.setItem('munitquest_draft', JSON.stringify(data));
    localStorage.setItem('munitquest_draft_section', currentSection);

    const statusDiv = document.getElementById('submissionStatus');
    statusDiv.className = 'mf-submission-status mf-success';
    statusDiv.textContent = 'Draft saved successfully!';
    statusDiv.style.display = 'block';
    setTimeout(() => { statusDiv.style.display = 'none'; }, 3000);
}

function autoSave() {
    const data = getFormData();
    localStorage.setItem('munitquest_draft', JSON.stringify(data));
    localStorage.setItem('munitquest_draft_section', currentSection);
}

function loadDraft() {
    const savedData = localStorage.getItem('munitquest_draft');
    const savedSection = localStorage.getItem('munitquest_draft_section');

    if (savedData && confirm('Would you like to continue from your saved draft?')) {
        const data = JSON.parse(savedData);

        // Restore authors array
        if (data.authors && Array.isArray(data.authors)) {
            const authorsList = document.getElementById('authorsList');
            const existingInputs = authorsList.querySelectorAll('input[name="authors[]"]');
            // Fill first input
            if (existingInputs[0]) existingInputs[0].value = data.authors[0] || '';
            // Add extra author entries
            for (let i = 1; i < data.authors.length; i++) {
                addAuthor();
                const inputs = authorsList.querySelectorAll('input[name="authors[]"]');
                inputs[i].value = data.authors[i];
            }
            delete data.authors;
        }

        for (let [key, value] of Object.entries(data)) {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value === 'on';
                } else if (input.type === 'radio') {
                    const radio = document.querySelector(`[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    input.value = value;
                }
            }
        }

        // Trigger conditional show/hide
        const dataTypeChecked = document.querySelector('input[name="dataType"]:checked');
        if (dataTypeChecked) handleDataTypeChange();

        const healthChecked = document.querySelector('input[name="healthStatus"]:checked');
        if (healthChecked) healthChecked.dispatchEvent(new Event('change'));

        if (savedSection) {
            showSection(parseInt(savedSection));
        }
    }
}

function hasUnsavedChanges() {
    const currentData = JSON.stringify(getFormData());
    const savedData = localStorage.getItem('munitquest_draft');
    return currentData !== savedData;
}
