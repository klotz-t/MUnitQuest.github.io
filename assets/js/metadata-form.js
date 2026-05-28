// MUnitQuest Metadata Form - Client-side JSON download

// Global variables
let currentSection = 1;
const totalSections = 7; // sections 1-6 + review (section 7); synthetic details are inline in section 1

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    updateNavigation();
    try { loadDraft(); } catch(e) { console.warn('Draft restore failed:', e); }
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

    // Decomposition method radio cards - show/hide subsections
    document.querySelectorAll('input[name="decompositionMethod"]').forEach(radio => {
        radio.addEventListener('change', handleDecompositionMethodChange);
    });

    // iEMG decomposition method radio cards
    document.querySelectorAll('input[name="iemgDecompositionMethod"]').forEach(radio => {
        radio.addEventListener('change', handleIemgDecompositionMethodChange);
    });

    // Progress bar step navigation
    document.querySelectorAll('.mf-progress-step').forEach((step, index) => {
        step.style.cursor = 'pointer';
        step.addEventListener('click', function() {
            const visible = getVisibleSections();
            const sectionNum = visible[index];
            if (sectionNum) showSection(sectionNum);
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

// Handle data type change - show/hide synthetic sub-section and decomposition blocks
function handleDataTypeChange() {
    const selectedType = document.querySelector('input[name="dataType"]:checked').value;
    const isSynthetic  = selectedType.startsWith('synthetic');
    const isConcurrent = selectedType === 'experimental_iemg';

    document.getElementById('syntheticDataSection').style.display = isSynthetic ? 'block' : 'none';
    document.getElementById('pipelineRequiredMark').style.display = 'inline';

    // Hide notice, reveal decomposition blocks
    document.getElementById('decompSection2Notice').style.display = 'none';
    document.getElementById('semgDecompBlock').style.display = 'block';
    document.getElementById('iemgDecompBlock').style.display = isConcurrent ? 'block' : 'none';

    // Only show "Surface EMG" heading when iEMG block is also visible
    const semgHeading = document.getElementById('semgDecompHeading');
    if (semgHeading) semgHeading.style.display = isConcurrent ? '' : 'none';

    // Show/hide the correct sEMG method cards
    document.querySelectorAll('.mf-dec-opt').forEach(card => {
        card.style.display = 'none';
        card.querySelector('input').checked = false;
    });
    if (isSynthetic) {
        document.querySelectorAll('.mf-dec-simulation').forEach(c => c.style.display = '');
        const gtRadio = document.querySelector('input[name="decompositionMethod"][value="ground-truth"]');
        if (gtRadio) { gtRadio.checked = true; }
    } else {
        document.querySelectorAll('.mf-dec-experimental').forEach(c => c.style.display = '');
    }
    handleDecompositionMethodChange();
}

// sEMG: show/hide algorithm / editing subsections
function handleDecompositionMethodChange() {
    const method = document.querySelector('input[name="decompositionMethod"]:checked')?.value || '';
    document.getElementById('decompositionAlgorithmSection').style.display =
        (method === 'fully-automated' || method === 'semi-automated') ? 'block' : 'none';
    document.getElementById('editingToolSection').style.display =
        method === 'semi-automated' ? 'block' : 'none';
}

// iEMG: show/hide algorithm / editing / annotation subsections
function handleIemgDecompositionMethodChange() {
    const method = document.querySelector('input[name="iemgDecompositionMethod"]:checked')?.value || '';
    document.getElementById('iemgDecompositionAlgorithmSection').style.display =
        (method === 'fully-automated' || method === 'semi-automated') ? 'block' : 'none';
    document.getElementById('iemgEditingToolSection').style.display =
        method === 'semi-automated' ? 'block' : 'none';
    document.getElementById('iemgAnnotationToolSection').style.display =
        method === 'manual' ? 'block' : 'none';
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

// Decomposition pipelines (GeneratedBy entries for section 6)
const decompositionPipelineSchema = [
    { name: "decomp_name",        type: "text", label: "Name *",      placeholder: "e.g., DEMUSE, convolutive BSS, CKC" },
    { name: "decomp_version",     type: "text", label: "Version",     placeholder: "e.g., 1.0.0" },
    { name: "decomp_description", type: "text", label: "Description", placeholder: "Brief description of the algorithm" },
    { name: "decomp_codeUrl",     type: "text", label: "CodeURL",     placeholder: "e.g., https://github.com/..." }
];

function addDecompositionPipeline() {
    addListItem("decompositionPipelineList", decompositionPipelineSchema, "mf-misc-entry", "Algorithm");
}

// Editing tool (optional second GeneratedBy entry if different from decomp tool)
const editingToolSchema = [
    { name: "edit_name",        type: "text", label: "Name",        placeholder: "e.g., OTBiolab+, custom script" },
    { name: "edit_version",     type: "text", label: "Version",     placeholder: "e.g., 2.3.1" },
    { name: "edit_description", type: "text", label: "Description", placeholder: "Brief description" },
    { name: "edit_codeUrl",     type: "text", label: "CodeURL",     placeholder: "e.g., https://github.com/..." }
];

function addEditingTool() {
    addListItem("editingToolList", editingToolSchema, "mf-misc-entry", "Editing Tool");
}

// iEMG decomposition pipelines
const iemgDecompositionPipelineSchema = [
    { name: "iemg_decomp_name",        type: "text", label: "Name *",      placeholder: "e.g., Spike2, OTBiolab+" },
    { name: "iemg_decomp_version",     type: "text", label: "Version",     placeholder: "e.g., 1.0.0" },
    { name: "iemg_decomp_description", type: "text", label: "Description", placeholder: "Brief description" },
    { name: "iemg_decomp_codeUrl",     type: "text", label: "CodeURL",     placeholder: "e.g., https://github.com/..." }
];

function addIemgDecompositionPipeline() {
    addListItem("iemgDecompositionPipelineList", iemgDecompositionPipelineSchema, "mf-misc-entry", "Algorithm");
}

const iemgEditingToolSchema = [
    { name: "iemg_edit_name",        type: "text", label: "Name",        placeholder: "e.g., Spike2, custom script" },
    { name: "iemg_edit_version",     type: "text", label: "Version",     placeholder: "e.g., 2.3.1" },
    { name: "iemg_edit_description", type: "text", label: "Description", placeholder: "Brief description" },
    { name: "iemg_edit_codeUrl",     type: "text", label: "CodeURL",     placeholder: "e.g., https://github.com/..." }
];

function addIemgEditingTool() {
    addListItem("iemgEditingToolList", iemgEditingToolSchema, "mf-misc-entry", "Editing Tool");
}

const iemgAnnotationToolSchema = [
    { name: "iemg_annot_name",        type: "text", label: "Name *",      placeholder: "e.g., Spike2, MATLAB custom" },
    { name: "iemg_annot_version",     type: "text", label: "Version",     placeholder: "e.g., 1.0.0" },
    { name: "iemg_annot_description", type: "text", label: "Description", placeholder: "Brief description" },
    { name: "iemg_annot_codeUrl",     type: "text", label: "CodeURL",     placeholder: "e.g., https://github.com/..." }
];

function addIemgAnnotationTool() {
    addListItem("iemgAnnotationToolList", iemgAnnotationToolSchema, "mf-misc-entry", "Annotation Tool");
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

// Recordings CSV upload
let recordingsData = [];
const RECORDING_COLS = ['sub', 'ses', 'task_name', 'run', 'setup', 'path_to_emg_file', 'path_to_labels_file'];

// Setup / coordsystems / channels+electrodes CSV uploads
let setupData = [];
let coordsystemsData = [];
let channelsElectrodesData = [];

const SETUP_REQUIRED_COLS = ['setup_name', 'SamplingFrequency', 'PowerLineFrequency', 'RecordingType', 'SoftwareHighPassHz', 'SoftwareLowPassHz', 'EMGReference', 'EMGPlacementScheme'];
const COORDSYSTEMS_REQUIRED_COLS = ['setup', 'name', 'type', 'units', 'description'];
const CHANNELS_REQUIRED_COLS = ['setup', 'electrode_name', 'channel_name', 'type', 'units'];

function handleRecordingsUpload(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => validateAndParseRecordings(e.target.result);
    reader.readAsText(file);
}

function validateAndParseRecordings(csvText) {
    const msgEl = document.getElementById('recordingsValidationMsg');
    const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim());

    if (lines.length === 0) {
        showRecordingMsg(msgEl, ['File is empty.'], 'error');
        recordingsData = [];
        return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const dataRows = lines.slice(1);

    const missing    = RECORDING_COLS.filter(c => !headers.includes(c));
    const unexpected = headers.filter(h => !RECORDING_COLS.includes(h));
    const warnings   = [];

    if (missing.length)    warnings.push(`Missing expected columns: ${missing.join(', ')}`);
    if (unexpected.length) warnings.push(`Unexpected columns will be ignored: ${unexpected.join(', ')}`);
    if (dataRows.length === 0) warnings.push('No recording rows found.');

    recordingsData = dataRows.map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
    });

    if (missing.length) {
        showRecordingMsg(msgEl, warnings, 'error');
        recordingsData = [];
    } else if (warnings.length) {
        showRecordingMsg(msgEl, warnings, 'warning');
    } else {
        showRecordingMsg(msgEl, [`${dataRows.length} recording(s) loaded.`], 'ok');
    }
}

function showRecordingMsg(el, messages, type) {
    const icons = { ok: '✓', warning: '⚠', error: '✕' };
    el.className = `mf-participants-msg mf-participants-${type}`;
    el.innerHTML = messages.map(m => `${icons[type]} ${m}`).join('<br>');
}

// --- CSV parsing helpers ---

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += line[i];
        }
    }
    result.push(current);
    return result;
}

function parseCSV(csvText) {
    const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
        const vals = parseCSVLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim().replace(/^"|"$/g, ''); });
        return obj;
    }).filter(row => Object.values(row).some(v => v));
    return { headers, rows };
}

function triggerDownload(content, filename, mimeType = 'text/csv') {
    const blob = new Blob([content], { type: mimeType });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 100);
}

function showCsvMsg(el, messages, type) {
    const icons = { ok: '✓', warning: '⚠', error: '✕' };
    el.className = `mf-participants-msg mf-participants-${type}`;
    el.innerHTML = messages.map(m => `${icons[type]} ${m}`).join('<br>');
}

// --- Setup CSV ---

function handleSetupUpload(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => validateAndParseSetup(e.target.result);
    reader.readAsText(file);
}

function validateAndParseSetup(csvText) {
    const msgEl = document.getElementById('setupValidationMsg');
    const { headers, rows } = parseCSV(csvText);
    const warnings = [];

    if (rows.length === 0) {
        showCsvMsg(msgEl, ['File is empty or has no data rows.'], 'error');
        setupData = [];
        return;
    }

    const missing = SETUP_REQUIRED_COLS.filter(c => !headers.includes(c));
    const unexpected = headers.filter(h => !['setup_name','Manufacturer','ManufacturersModelName','ElectrodeManufacturer','ElectrodeManufacturersModelName','SamplingFrequency','PowerLineFrequency','RecordingType','SoftwareHighPassHz','SoftwareLowPassHz','HardwareHighPassHz','HardwareLowPassHz','EMGChannelCount','EMGReference','EMGPlacementScheme','TaskDescription','Instructions'].includes(h));

    if (missing.length) {
        showCsvMsg(msgEl, [`Missing required columns: ${missing.join(', ')}`], 'error');
        setupData = [];
        return;
    }
    if (unexpected.length) warnings.push(`Unrecognised columns (will be ignored): ${unexpected.join(', ')}`);

    setupData = rows;

    if (warnings.length) {
        showCsvMsg(msgEl, [`${rows.length} setup(s) loaded. ` + warnings.join(' ')], 'warning');
    } else {
        showCsvMsg(msgEl, [`${rows.length} setup(s) loaded: ${rows.map(r => r.setup_name).join(', ')}`], 'ok');
    }
}

// --- Coordinate systems CSV ---

function handleCoordsystemsUpload(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => validateAndParseCoordsystems(e.target.result);
    reader.readAsText(file);
}

function validateAndParseCoordsystems(csvText) {
    const msgEl = document.getElementById('coordsystemsValidationMsg');
    const { headers, rows } = parseCSV(csvText);

    if (rows.length === 0) {
        showCsvMsg(msgEl, ['File is empty or has no data rows.'], 'error');
        coordsystemsData = [];
        return;
    }

    const missing = COORDSYSTEMS_REQUIRED_COLS.filter(c => !headers.includes(c));
    if (missing.length) {
        showCsvMsg(msgEl, [`Missing required columns: ${missing.join(', ')}`], 'error');
        coordsystemsData = [];
        return;
    }

    coordsystemsData = rows;
    const setups = [...new Set(rows.map(r => r.setup).filter(Boolean))];
    showCsvMsg(msgEl, [`${rows.length} coordinate system(s) loaded across ${setups.length} setup(s).`], 'ok');
}

// --- Channels + Electrodes CSV ---

function handleChannelsElectrodesUpload(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => validateAndParseChannelsElectrodes(e.target.result);
    reader.readAsText(file);
}

function validateAndParseChannelsElectrodes(csvText) {
    const msgEl = document.getElementById('channelsElectrodesValidationMsg');
    const { headers, rows } = parseCSV(csvText);

    if (rows.length === 0) {
        showCsvMsg(msgEl, ['File is empty or has no data rows.'], 'error');
        channelsElectrodesData = [];
        return;
    }

    const missing = CHANNELS_REQUIRED_COLS.filter(c => !headers.includes(c));
    if (missing.length) {
        showCsvMsg(msgEl, [`Missing required columns: ${missing.join(', ')}`], 'error');
        channelsElectrodesData = [];
        return;
    }

    channelsElectrodesData = rows;
    const setups = [...new Set(rows.map(r => r.setup).filter(Boolean))];
    showCsvMsg(msgEl, [`${rows.length} channel(s) loaded across ${setups.length} setup(s).`], 'ok');
}

// --- Pre-filled setup.csv download ---



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
        if (input.offsetParent === null) continue; // skip inputs inside hidden blocks
        if (!input.checkValidity()) return false;
    }
    if (sectionNumber === 3) {
        if (participantsData.length === 0) return false;
    }
    if (sectionNumber === 4) {
        if (setupData.length === 0) return false;
        if (channelsElectrodesData.length === 0) return false;
        if (coordsystemsData.length === 0) return false;
    }
    if (sectionNumber === 5) {
        if (recordingsData.length === 0) return false;
    }
    if (sectionNumber === 6) {
        // sEMG block must have a method selected (block hidden for unset dataset type → skip)
        const semgBlock = document.getElementById('semgDecompBlock');
        if (semgBlock && semgBlock.offsetParent !== null) {
            const method = document.querySelector('input[name="decompositionMethod"]:checked')?.value;
            if (!method) return false;
            if (method === 'fully-automated' || method === 'semi-automated') {
                const pipelines = document.querySelectorAll('#decompositionPipelineList .mf-misc-entry');
                if (pipelines.length === 0) return false;
                for (const p of pipelines) {
                    const nameInput = p.querySelector('[name="decomp_name[]"]');
                    if (!nameInput || !nameInput.value.trim()) return false;
                }
            }
        }
        // iEMG block validation (only when visible, i.e. concurrent dataset)
        const iemgBlock = document.getElementById('iemgDecompBlock');
        if (iemgBlock && iemgBlock.offsetParent !== null) {
            const iemgMethod = document.querySelector('input[name="iemgDecompositionMethod"]:checked')?.value;
            if (!iemgMethod) return false;
            if (iemgMethod === 'fully-automated' || iemgMethod === 'semi-automated') {
                const pipelines = document.querySelectorAll('#iemgDecompositionPipelineList .mf-misc-entry');
                if (pipelines.length === 0) return false;
                for (const p of pipelines) {
                    const nameInput = p.querySelector('[name="iemg_decomp_name[]"]');
                    if (!nameInput || !nameInput.value.trim()) return false;
                }
            }
        }
    }
    if (sectionNumber === 2) {
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

    const setups = [...new Set(recordingsData.map(r => r.setup).filter(Boolean))];
    const taskNames = [...new Set(recordingsData.map(r => r.task_name).filter(Boolean))];

    let html = '<h4>Dataset Information</h4>';
    html += `<p><strong>Dataset:</strong> ${data.datasetName || 'N/A'}</p>`;
    html += `<p><strong>Data Type:</strong> ${data.dataType || 'N/A'}</p>`;
    html += '<h4>Recording Details</h4>';
    html += `<p><strong>Participants:</strong> ${participantsData.length || 'none uploaded'}</p>`;
    html += `<p><strong>Recordings:</strong> ${recordingsData.length || 'none uploaded'}</p>`;
    html += `<p><strong>Tasks:</strong> ${taskNames.length ? taskNames.join(', ') : 'N/A'}</p>`;
    html += `<p><strong>Setups:</strong> ${setups.length ? setups.join(', ') : 'N/A'}</p>`;
    html += `<p><strong>Manufacturer:</strong> ${data.manufacturer || 'N/A'} ${data.manufacturerModel || ''}</p>`;
    html += `<p><strong>Sampling Frequency:</strong> ${data.samplingFrequency || 'N/A'} Hz</p>`;
    html += '<h4>Motor Units</h4>';
    html += `<p><strong>Total Motor Units:</strong> ${data.numMotorUnits || 'N/A'}</p>`;
    html += `<p><strong>Decomposition Method:</strong> ${data.decompositionMethod || 'N/A'}</p>`;

    reviewSummary.innerHTML = html;
    getBIDS_datasetJson(data);
    getBIDS_subjectsTSV(data);
    getBIDS_emgJson();
    getBIDS_channelsTSV();
    getBIDS_electrodesTSV();
    getBIDS_coordsystemJSON();
}

function buildBIDS_datasetJson(data) {
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

    const decompMethod = document.querySelector('input[name="decompositionMethod"]:checked')?.value;
    if (decompMethod === 'fully-automated' || decompMethod === 'semi-automated') {
        const decompPipelines = buildArrayFromListFields(
            "decompositionPipelineList",
            ["decomp_name", "decomp_version", "decomp_description", "decomp_codeUrl"],
            (entry) => ({
                "Name":        entry.decomp_name        || "",
                "Version":     entry.decomp_version     || undefined,
                "Description": entry.decomp_description || undefined,
                "CodeURL":     entry.decomp_codeUrl     || undefined
            })
        );
        generatedBy.push(...decompPipelines);
    }
    if (decompMethod === 'semi-automated') {
        const editingTools = buildArrayFromListFields(
            "editingToolList",
            ["edit_name", "edit_version", "edit_description", "edit_codeUrl"],
            (entry) => ({
                "Name":        entry.edit_name        || "",
                "Version":     entry.edit_version     || undefined,
                "Description": entry.edit_description || undefined,
                "CodeURL":     entry.edit_codeUrl     || undefined
            })
        );
        generatedBy.push(...editingTools);
    }

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

    if (generatedBy.length > 0)    bids["GeneratedBy"]    = generatedBy;
    if (sourceDatasets.length > 0) bids["SourceDatasets"] = sourceDatasets;

    return bids;
}

function getBIDS_datasetJson(data) {
    const bids = buildBIDS_datasetJson(data);
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

// --- BIDS filename helpers ---

function bidsPrefix(sub, ses) {
    let p = `sub-${sub}`;
    if (ses && ses !== '') p += `_ses-${ses}`;
    return p;
}

function bidsFolder(sub, ses) {
    let f = `sub-${sub}/`;
    if (ses && ses !== '') f += `ses-${ses}/`;
    return f + 'emg/';
}

// --- BIDS output builders ---

function buildBIDS_emgJson(rec, setupRow) {
    const def = v => (v && v !== '') ? v : undefined;
    const defNum = v => { const n = parseFloat(v); return isNaN(n) ? undefined : n; };
    const defInt = v => { const n = parseInt(v); return isNaN(n) ? undefined : n; };

    const raw = {
        TaskName: def(rec.task_name) || 'n/a',
        Manufacturer: def(setupRow.Manufacturer) || 'n/a',
        ManufacturersModelName: def(setupRow.ManufacturersModelName) || 'n/a',
        SamplingFrequency: defNum(setupRow.SamplingFrequency) ?? 'n/a',
        PowerLineFrequency: defNum(setupRow.PowerLineFrequency) ?? 'n/a',
        RecordingType: def(setupRow.RecordingType) || 'continuous',
        SoftwareFilters: {
            HighPassFilter: { HalfAmplitudeCutOffHz: defNum(setupRow.SoftwareHighPassHz) ?? 'n/a' },
            LowPassFilter:  { HalfAmplitudeCutOffHz: defNum(setupRow.SoftwareLowPassHz)  ?? 'n/a' }
        },
        HardwareFilters: (setupRow.HardwareHighPassHz || setupRow.HardwareLowPassHz) ? {
            HighPassFilter: { HalfAmplitudeCutOffHz: defNum(setupRow.HardwareHighPassHz) ?? 'n/a' },
            LowPassFilter:  { HalfAmplitudeCutOffHz: defNum(setupRow.HardwareLowPassHz)  ?? 'n/a' }
        } : undefined,
        ElectrodeManufacturer: def(setupRow.ElectrodeManufacturer),
        ElectrodeManufacturersModelName: def(setupRow.ElectrodeManufacturersModelName),
        EMGReference: def(setupRow.EMGReference) || 'n/a',
        EMGPlacementScheme: (() => { const v = def(setupRow.EMGPlacementScheme); return v ? v.charAt(0).toUpperCase() + v.slice(1) : 'n/a'; })(),
        EMGChannelCount: defInt(setupRow.EMGChannelCount),
        TaskDescription: def(setupRow.TaskDescription),
        Instructions: def(setupRow.Instructions),
        InstitutionName: def(document.getElementById('institutionName')?.value),
        InstitutionAddress: def(document.getElementById('institutionAddress')?.value),
        InstitutionalDepartmentName: def(document.getElementById('institutionalDepartmentName')?.value),
    };

    return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));
}

function buildBIDS_channelsTSV(setupName) {
    const rows = channelsElectrodesData.filter(r =>
        r.setup === setupName && r.channel_name && r.channel_name !== 'n/a'
    );
    if (rows.length === 0) return '(no channels data for this setup)';

    const cols = ['channel_name','type','units','electrode_name','reference','group','target_muscle','low_cutoff','high_cutoff'];
    const bidsNames = ['name','type','units','signal_electrode','reference','group','target_muscle','low_cutoff','high_cutoff'];

    const lines = rows.map(r =>
        cols.map(c => (r[c] && r[c] !== '') ? r[c] : 'n/a').join('\t')
    );
    return [bidsNames.join('\t'), ...lines].join('\n');
}

function buildBIDS_electrodesTSV(setupName) {
    const rows = channelsElectrodesData.filter(r =>
        r.setup === setupName && r.electrode_name && r.electrode_name !== 'n/a'
    );
    if (rows.length === 0) return '(no electrode position data for this setup)';

    const seen = new Set();
    const unique = rows.filter(r => {
        if (seen.has(r.electrode_name)) return false;
        seen.add(r.electrode_name);
        return true;
    });

    const header = 'name\tx\ty\tz\tcoordinate_system\ttype\tmaterial\timpedance\tgroup';
    const lines = unique.map(r => [
        r.electrode_name, r.x, r.y, r.z,
        r.coordinate_system, r.type, r.material, r.impedance, r.group
    ].map(v => (v && v !== '') ? v : 'n/a').join('\t'));

    return [header, ...lines].join('\n');
}

// Returns { spaceName: jsonObject } — one entry per coordinate system row (anatomical + grids).
// Each grid gets its own space-{name}_coordsystem.json with top-level ParentCoordinateSystem,
// AnchorElectrode, AnchorCoordinates fields per the BIDS EMG spec.
function buildBIDS_coordsystemJSONs(setupName) {
    const rows = coordsystemsData.filter(r => r.setup === setupName);
    if (rows.length === 0) return {};

    const result = {};
    for (const row of rows) {
        const json = {
            EMGCoordinateSystem: 'Other',
            EMGCoordinateUnits: row.units,
        };
        if (row.description) json.EMGCoordinateSystemDescription = row.description;
        if (row.parent_coord_system) json.ParentCoordinateSystem = row.parent_coord_system;
        if (row.anchor_electrode) json.AnchorElectrode = row.anchor_electrode;
        if (row.anchor_x || row.anchor_y) {
            json.AnchorCoordinates = [
                parseFloat(row.anchor_x) || 0,
                parseFloat(row.anchor_y) || 0,
            ];
        }
        result[row.name] = json;
    }
    return result;
}

function getBIDS_emgJson() {
    const setupRow = setupData[0];
    const rec = recordingsData.find(r => r.setup === setupRow?.setup_name) || {};
    const bids = setupRow ? buildBIDS_emgJson(rec, setupRow) : { '(no setup file uploaded)': true };
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

function getBIDS_channelsTSV() {
    const setupName = setupData[0]?.setup_name;
    const tsv = setupName ? buildBIDS_channelsTSV(setupName) : '(no setup file uploaded)';
    document.getElementById('bidsChannelsPreview').textContent = tsv;
}

function getBIDS_electrodesTSV() {
    const setupName = setupData[0]?.setup_name;
    const tsv = setupName ? buildBIDS_electrodesTSV(setupName) : '(no setup file uploaded)';
    document.getElementById('bidsElectrodesPreview').textContent = tsv;
}

function getBIDS_coordsystemJSON() {
    const setupName = setupData[0]?.setup_name;
    const jsons = setupName ? buildBIDS_coordsystemJSONs(setupName) : {};
    const entries = Object.entries(jsons);
    if (entries.length === 0) {
        document.getElementById('bidsCoordPreview').textContent = '(no coordinate system data for first setup)';
        return;
    }
    const text = entries.map(([name, json]) =>
        `// space-${name}_coordsystem.json\n${JSON.stringify(json, null, 2)}`
    ).join('\n\n');
    document.getElementById('bidsCoordPreview').textContent = text;
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

// Build the internal metadata summary (used for draft save/restore context)
function buildMetadata() {
    const data = getFormData();
    return {
        dataset: {
            name: data.datasetName || "",
            description: data.datasetDescription || "",
            dataType: data.dataType || "",
            license: data.license === 'other' ? (data.otherLicense || "") : (data.license || ""),
            authors: getArrayField("author", { emptyValue: "" }),
            institutionName: data.institutionName || "",
            institutionAddress: data.institutionAddress || ""
        },
        participants: participantsData,
        recordings: recordingsData,
        setups: setupData,
        labeling: {
            decompositionMethod: data.decompositionMethod || "",
            numMotorUnits: parseInt(data.numMotorUnits) || null
        }
    };
}


async function handleDownload(e) {
    e.preventDefault();

    const visible = getVisibleSections().filter(n => n !== 7);
    visible.forEach(n => { sectionValidState[n] = checkSection(n); });
    updateProgressBar();
    if (visible.some(n => !sectionValidState[n])) {
        alert('Some sections are incomplete. Please check the highlighted steps in the progress bar.');
        return;
    }

    const data = getFormData();
    const zip = new JSZip();
    const datasetName = (data.datasetName || 'bids_dataset').replace(/[^a-zA-Z0-9_-]/g, '_');

    // Root-level files
    zip.file('dataset_description.json', JSON.stringify(buildBIDS_datasetJson(data), null, 2));

    if (participantsData.length > 0) {
        const headers = Object.keys(participantsData[0]);
        const lines = participantsData.map(row => headers.map(h => {
            if (h === 'participant_id') {
                const v = row[h] || '';
                return v.startsWith('sub-') ? v : `sub-${v}`;
            }
            return row[h] || 'n/a';
        }).join('\t'));
        zip.file('participants.tsv', [headers.join('\t'), ...lines].join('\n'));
        zip.file('participants.json', JSON.stringify({
            participant_id: { Description: 'Unique subject identifier' },
            age:            { Description: 'Age of the participant at time of testing', Unit: 'years' },
            sex:            { Description: 'Biological sex of the participant' },
            handedness:     { Description: 'Handedness as reported by participant' },
            weight:         { Description: 'Body weight of the participant', Unit: 'kg' },
            height:         { Description: 'Body height of the participant', Unit: 'm' },
            group:          { Description: 'Experimental group the participant belongs to' },
        }, null, 2));
    }

    // Group recordings by (sub, ses) — determines inheritance scope
    const groups = {};
    for (const rec of recordingsData) {
        const key = `${rec.sub}|||${rec.ses || ''}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(rec);
    }

    for (const [key, recs] of Object.entries(groups)) {
        const [sub, ses] = key.split('|||');
        const folder = bidsFolder(sub, ses);
        const prefix = bidsPrefix(sub, ses);

        // Determine setup for this sub/ses (use first; warn if mixed)
        const setupName = recs.map(r => r.setup).filter(Boolean)[0];
        const setupRow  = setupData.find(r => r.setup_name === setupName) || {};

        // Inherited files: electrodes.tsv + coordsystem.json (one per sub/ses)
        const elecTSV = buildBIDS_electrodesTSV(setupName);
        if (elecTSV) zip.file(`${folder}${prefix}_electrodes.tsv`, elecTSV);

        const coordJSONs = buildBIDS_coordsystemJSONs(setupName);
        for (const [coordName, coordJSON] of Object.entries(coordJSONs)) {
            zip.file(`${folder}${prefix}_space-${coordName}_coordsystem.json`,
                JSON.stringify(coordJSON, null, 2));
        }

        // Per-recording files: emg.json + channels.tsv
        for (const rec of recs) {
            let recPrefix = `${prefix}_task-${rec.task_name}`;
            if (rec.run && rec.run !== '') recPrefix += `_run-${rec.run}`;
            zip.file(`${folder}${recPrefix}_emg.json`,
                JSON.stringify(buildBIDS_emgJson(rec, setupRow), null, 2));
            const chTSV = buildBIDS_channelsTSV(setupName);
            if (chTSV && !chTSV.startsWith('(')) zip.file(`${folder}${recPrefix}_channels.tsv`, chTSV);
        }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const zipName = `${datasetName}_metadata.zip`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 100);

    const statusDiv = document.getElementById('submissionStatus');
    statusDiv.className = 'mf-submission-status mf-success';
    statusDiv.innerHTML = `<strong>${zipName} downloaded!</strong><br>Contains BIDS metadata for ${Object.keys(groups).length} subject/session(s).`;
    statusDiv.style.display = 'block';

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
