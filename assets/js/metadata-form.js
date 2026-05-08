// MUnitQuest Metadata Form - Client-side JSON download

// Global variables
let currentSection = 1;
const totalSections = 7; // sections 1-6 + review (section 7); synthetic details are inline in section 1

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
            const group = document.getElementById('pathologicalConditionsGroup');
            if (group) group.style.display =
                (this.value === 'pathological' || this.value === 'mixed') ? 'block' : 'none';
        });
    });

    // Contraction type - show/hide specific fields
    ['contractionIsometric', 'contractionConcentric', 'contractionEccentric', 'contractionMixed'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', toggleContractionFields);
    });

    // Force data - show/hide fields
    document.querySelectorAll('input[name="forceDataIncluded"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const el = document.getElementById('forceDataFields');
            if (el) el.style.display = this.value === 'yes' ? 'block' : 'none';
        });
    });

    // Kinematics data - show/hide fields
    document.querySelectorAll('input[name="kinematicsDataIncluded"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const el = document.getElementById('kinematicsDataFields');
            if (el) el.style.display = this.value === 'yes' ? 'block' : 'none';
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

// Handle data type change - show/hide synthetic sub-section within section 2
function handleDataTypeChange() {
    const selectedType = document.querySelector('input[name="dataType"]:checked').value;
    const isSynthetic = selectedType.startsWith('synthetic');
    document.getElementById('syntheticDataSection').style.display = isSynthetic ? 'block' : 'none';
    document.getElementById('pipelineRequiredMark').style.display = 'inline';
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

        const labelHtml = field.label ? `<label>${field.label}</label>` : "";

        if (field.type === "select") {
            html += `
                <div class="mf-field-row" data-field="${field.name}" ${dependsAttr}>
                    ${labelHtml}
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
                    ${labelHtml}
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

// Synthetic pipelines (GeneratedBy entries)
const syntheticPipelineSchema = [
    { name: "sim_name",        type: "text", label: "Name *",      placeholder: "e.g., NeuroMotion, MyoGen, Manual" },
    { name: "sim_version",     type: "text", label: "Version",     placeholder: "e.g., 1.0.0" },
    { name: "sim_description", type: "text", label: "Description", placeholder: "What this pipeline does" },
    { name: "sim_codeUrl",     type: "text", label: "CodeURL",     placeholder: "e.g., https://github.com/..." }
];

function addSyntheticPipeline() {
    addListItem("syntheticPipelineList", syntheticPipelineSchema, "mf-misc-entry", "Pipeline");
}

// Source datasets (SourceDatasets entries)
const sourceDatasetSchema = [
    { name: "src_doi",     type: "text", label: "DOI",     placeholder: "e.g., 10.18112/openneuro.ds004632.v1.0.0" },
    { name: "src_url",     type: "text", label: "URL",     placeholder: "e.g., https://openneuro.org/datasets/ds004632" },
    { name: "src_version", type: "text", label: "Version", placeholder: "e.g., 1.0.0" }
];

function addSourceDataset() {
    addListItem("sourceDatasetList", sourceDatasetSchema, "mf-misc-entry", "Source Dataset");
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
// Participants CSV upload
let participantsData = [];
const PARTICIPANT_COLS = ['participant_id', 'sex', 'age', 'height', 'weight', 'handedness', 'group'];

function handleParticipantsUpload(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => validateAndParseParticipants(e.target.result);
    reader.readAsText(file);
}

function validateAndParseParticipants(csvText) {
    const msgEl = document.getElementById('participantsValidationMsg');
    const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim());

    if (lines.length === 0) {
        showParticipantMsg(msgEl, ['File is empty.'], 'error');
        participantsData = [];
        return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const dataRows = lines.slice(1);

    const unexpected = headers.filter(h => !PARTICIPANT_COLS.includes(h));
    const missing    = PARTICIPANT_COLS.filter(c => !headers.includes(c));
    const warnings   = [];

    if (missing.length)    warnings.push(`Missing expected columns: ${missing.join(', ')}`);
    if (unexpected.length) warnings.push(`Unexpected columns will be ignored: ${unexpected.join(', ')}`);
    if (dataRows.length === 0) warnings.push('No participant rows found.');
    if (dataRows.length > 1000) warnings.push(`${dataRows.length} rows — maximum is 1000.`);

    participantsData = dataRows.map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
    });

    if (warnings.length) {
        showParticipantMsg(msgEl, warnings, 'warning');
    } else {
        showParticipantMsg(msgEl, [`${dataRows.length} participant(s) loaded.`], 'ok');
    }
}

function showParticipantMsg(el, messages, type) {
    const icons = { ok: '✓', warning: '⚠', error: '✕' };
    el.className = `mf-participants-msg mf-participants-${type}`;
    el.innerHTML = messages.map(m => `${icons[type]} ${m}`).join('<br>');
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

// Tasks
const taskSchema = [
    { name: "taskName", type: "text", placeholder: "Unique task label, e.g., isometricContraction." },
    { name: "taskDescription", type: "text", placeholder: "Longer free-text description of the task."},
    { name: "taskInstructions", type: "text", placeholder: "Instructions given to participants before the recording."},
    { name: "taskRuns", type: "number", placeholder: "Number of repetitions.", min: 1, step: 1}
];

function addTask() {
    addListItem("taskList", taskSchema, "mf-task-entry", "task");
}


// Get the list of visible section numbers (data-section attributes) for navigation
function getVisibleSections() {
    // Synthetic details are now an inline sub-section within section 1, not a nav step.
    return [1, 2, 3, 4, 5, 6, 7]; // section 7 = Review
}

// Form navigation
function navigateForm(direction) {
    sectionValidState[currentSection] = checkSection(currentSection);
    updateProgressBar();

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

        if (sectionNumber === 7) {
            generateReview();
        }
    }
}

const sectionValidState = {};

function updateProgressBar() {
    const visible = getVisibleSections();
    const currentIdx = visible.indexOf(currentSection);

    document.querySelectorAll('.mf-progress-step').forEach((step, index) => {
        const sectionNum = visible[index];
        step.classList.remove('active', 'completed', 'invalid');

        if (index === currentIdx) {
            step.classList.add('active');
        } else if (sectionNum in sectionValidState) {
            step.classList.add(sectionValidState[sectionNum] ? 'completed' : 'invalid');
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
function checkSection(sectionNumber) {
    const section = document.querySelector(`.form-section[data-section="${sectionNumber}"]`);
    const inputs = section.querySelectorAll('input[required], select[required], textarea[required]');
    for (const input of inputs) {
        if (!input.checkValidity()) return false;
    }
    if (sectionNumber === 3) {
        if (participantsData.length === 0) return false;
    }
    if (sectionNumber === 1) {
        const dataTypeEl = document.querySelector('input[name="dataType"]:checked');
        if (!dataTypeEl) return false;
        const dataType = dataTypeEl.value;
        if (dataType.startsWith('synthetic')) {
            const pipelines = document.querySelectorAll('#syntheticPipelineList .mf-misc-entry');
            if (pipelines.length === 0) return false;
            for (const p of pipelines) {
                const nameInput = p.querySelector('[name="sim_name[]"]');
                if (!nameInput || !nameInput.value.trim()) return false;
            }
        }
    }
    return true;
}

function validateSection(sectionNumber) {
    const valid = checkSection(sectionNumber);
    if (!valid) {
        const section = document.querySelector(`.form-section[data-section="${sectionNumber}"]`);
        const firstInvalid = section.querySelector('input[required]:invalid, select[required]:invalid, textarea[required]:invalid');
        if (firstInvalid) firstInvalid.reportValidity();
    }
    return valid;
}

// Generate review summary
function generateReview() {
    const data = getFormData();
    const reviewSummary = document.getElementById('reviewSummary');

    let html = '<h4>Dataset Information</h4>';
    html += `<p><strong>Dataset:</strong> ${data.datasetName || 'N/A'}</p>`;
    html += `<p><strong>Data Type:</strong> ${data.dataType || 'N/A'}</p>`;

    html += '<h4>Recording Details</h4>';
    html += `<p><strong>Participants:</strong> ${participantsData.length || 'none uploaded'}</p>`;
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
    getBIDS_channelsTSV(data);
}

function getBIDS_datasetJson(data) {
    const isSynthetic = (data.dataType || "").startsWith("synthetic");

    const generatedBy = isSynthetic
        ? buildArrayFromListFields("syntheticPipelineList", ["sim_name", "sim_version", "sim_description", "sim_codeUrl"],
            (entry) => ({
                "Name":        entry.sim_name        || "",
                "Version":     entry.sim_version     || undefined,
                "Description": entry.sim_description || undefined,
                "CodeURL":     entry.sim_codeUrl     || undefined
            }))
        : [];

    const sourceDatasets = isSynthetic
        ? buildArrayFromListFields("sourceDatasetList", ["src_doi", "src_url", "src_version"],
            (entry) => ({
                "DOI":     entry.src_doi     || undefined,
                "URL":     entry.src_url     || undefined,
                "Version": entry.src_version || undefined
            }))
        : [];

    const bids = {
        "Name": data.datasetName || "",
        "BIDSVersion": "1.11.1",
        "DatasetType": "raw",
        "License": data.license || "",
        "Authors": getArrayField("author", { emptyValue: "" }),
        "Funding": getArrayField("funding", { emptyValue: "" }),
        "ReferencesAndLinks": getArrayField("reference", { emptyValue: "" }),
        "EthicsApprovals": getArrayField("ethics", { emptyValue: "" }),
        "InstitutionName": data.institutionName || "",
        "InstitutionAddress": data.institutionAddress || "",
    };

    if (generatedBy.length > 0)   bids["GeneratedBy"]    = generatedBy;
    if (sourceDatasets.length > 0) bids["SourceDatasets"] = sourceDatasets;

    document.getElementById('bidsDatasetPreview').textContent = JSON.stringify(bids, null, 2);
}

function buildArrayFromListFields(containerId, fieldNames, mapper) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const entries = container.querySelectorAll(".mf-misc-entry");
    return Array.from(entries).map(entry => {
        const values = {};
        fieldNames.forEach(name => {
            const el = entry.querySelector(`[name="${name}[]"]`);
            values[name] = el ? el.value.trim() : "";
        });
        const mapped = mapper(values);
        // strip undefined keys
        return Object.fromEntries(Object.entries(mapped).filter(([, v]) => v !== undefined && v !== ""));
    }).filter(obj => Object.keys(obj).length > 0);
}

function getBIDS_emgJson(data) {
    const bids = {
        "TaskName": (data.taskName || [])[0] || "n/a",
        "TaskDescription": (data.taskDescription || [])[0] || "n/a",
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
    if (participantsData.length === 0) {
        document.getElementById('bidsSubjectsPreview').textContent = '(no participants file uploaded)';
        return;
    }
    const headers = Object.keys(participantsData[0]);
    const lines = participantsData.map(row => headers.map(h => row[h] || '').join('\t'));
    document.getElementById('bidsSubjectsPreview').textContent = [headers.join('\t'), ...lines].join('\n');
}

function getBIDS_channelsTSV(data) {

    const channels = [];

    const length = 2

    // TODO fill with meaningfull content
    for (let i = 0; i < length; i++) {
        channels.push({
            name: `Ch${String(i + 1).padStart(3, "0")}`, 
            type: "EMG",
            units: "mV",
        });
    }

    let tsv = "name\ttype\tunits\n";

    channels.forEach((c, index) => {
        tsv += [
            c.name,
            c.type,
            c.units,
        ].join("\t") + "\n";
    });

    document.getElementById('bidsChannelsPreview').textContent = tsv;
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
        dataset: {
            name: data.datasetName || "",
            description: data.datasetDescription || "",
            dataType: data.dataType || "",
            license: data.license === 'other' ? (data.otherLicense || "") : (data.license || ""),
            authors: getArrayField("author", { emptyValue: "" }),
            fundingSources: data.fundingSources || "",
            ethicsApprovalNumber: data.ethicsApprovalNumber || "",
            ethicsCommittee: data.ethicsCommittee || "",
            institutionName: data.institutionName || "",
            institutionAddress: data.institutionAddress || ""
        },
        participants: participantsData,
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
            generatedBy: buildArrayFromListFields("syntheticPipelineList",
                ["sim_name", "sim_version", "sim_description", "sim_codeUrl"],
                (e) => ({ Name: e.sim_name, Version: e.sim_version, Description: e.sim_description, CodeURL: e.sim_codeUrl })),
            sourceDatasets: buildArrayFromListFields("sourceDatasetList",
                ["src_doi", "src_url", "src_version"],
                (e) => ({ DOI: e.src_doi, URL: e.src_url, Version: e.src_version }))
        } : null
    };
}

// Download metadata as JSON
function downloadMetadata(metadata) {
    const datasetName = (metadata.dataset.name || 'metadata').replace(/[^a-zA-Z0-9_-]/g, '_');
    const json = JSON.stringify(metadata, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${datasetName}_metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 100);
}

function handleDownload(e) {
    e.preventDefault();

    const visible = getVisibleSections().filter(n => n !== 7); // exclude review
    visible.forEach(n => { sectionValidState[n] = checkSection(n); });
    updateProgressBar();
    if (visible.some(n => !sectionValidState[n])) {
        alert('Some sections are incomplete. Please check the highlighted steps in the progress bar.');
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
