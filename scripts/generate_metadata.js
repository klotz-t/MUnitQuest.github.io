#!/usr/bin/env node
/**
 * generate_metadata.js
 * Reads form_inputs.json + the five CSV files and writes a metadata.zip.
 *
 * Usage (defaults):
 *   node scripts/generate_metadata.js
 *
 *   Reads  : assets/files/form_inputs.json  +  assets/files/template_*.csv
 *   Writes : tutorial/source_data/metadata.zip
 *
 * Usage (custom source dir):
 *   node scripts/generate_metadata.js --source-dir tutorial/source_data
 *
 *   Reads  : <source-dir>/form_inputs.json + <source-dir>/{recordings,participants,setup,coordsystems,channels_electrodes}.csv
 *   Writes : <source-dir>/metadata.zip
 *
 * The zip contains the BIDS sidecar folder structure (no .edf files):
 *   dataset_description.json
 *   README.md
 *   participants.tsv / participants.json
 *   sub-XX/[ses-XX/]emg/  ...channels.tsv, electrodes.tsv, coordsystem.json, emg.json
 */

const fs            = require('fs');
const path          = require('path');
const { execSync }  = require('child_process');
const os            = require('os');

// ---------------------------------------------------------------------------
// Paths — honour optional --source-dir argument
// ---------------------------------------------------------------------------
const SCRIPT_DIR = __dirname;
const REPO_ROOT  = path.join(SCRIPT_DIR, '..');

const srcArgIdx = process.argv.indexOf('--source-dir');
const SOURCE_DIR = srcArgIdx !== -1
    ? path.resolve(process.argv[srcArgIdx + 1])
    : null;

const FILES_DIR  = path.join(REPO_ROOT, 'assets', 'files');

// form_inputs.json: prefer source dir, fall back to assets/files
const formPath = SOURCE_DIR
    ? path.join(SOURCE_DIR, 'form_inputs.json')
    : path.join(FILES_DIR, 'form_inputs.json');
const FORM = JSON.parse(fs.readFileSync(formPath, 'utf8'));

// CSV loader: tries source dir first, then assets/files (template_ prefix)
function load(baseName) {
    if (SOURCE_DIR) {
        const p = path.join(SOURCE_DIR, baseName + '.csv');
        if (fs.existsSync(p)) return parseCSV(fs.readFileSync(p, 'utf8'));
    }
    return parseCSV(fs.readFileSync(path.join(FILES_DIR, 'template_' + baseName + '.csv'), 'utf8'));
}

// Output: temp dir for file tree, then zip to source dir or tutorial/
const TEMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'mq_metadata_'));
const ZIP_OUT  = SOURCE_DIR
    ? path.join(SOURCE_DIR, 'metadata.zip')
    : path.join(REPO_ROOT, 'tutorial', 'metadata.zip');

// OUT is now the temp staging dir (not used externally)
const OUT = TEMP_DIR;

// ---------------------------------------------------------------------------
// CSV parser (handles quoted fields with embedded commas)
// ---------------------------------------------------------------------------
function parseCSV(text) {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const parseLine = line => {
        const fields = [];
        let cur = '', inQ = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') {
                if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
                else inQ = !inQ;
            } else if (c === ',' && !inQ) {
                fields.push(cur.trim()); cur = '';
            } else {
                cur += c;
            }
        }
        fields.push(cur.trim());
        return fields;
    };
    const nonEmpty = lines.filter(l => l.trim() !== '');
    if (nonEmpty.length === 0) return [];
    const headers = parseLine(nonEmpty[0]);
    return nonEmpty.slice(1).map(line => {
        const vals = parseLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || '').trim(); });
        return obj;
    });
}

const participantsData       = load('participants');
const recordingsData         = load('recordings');
const setupData              = load('setup');
const coordsystemsData       = load('coordsystems');
const channelsElectrodesData = load('channels_electrodes');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const def    = v => (v && v !== '') ? v : undefined;
const defNum = v => { const n = parseFloat(v); return isNaN(n) ? undefined : n; };
const defInt = v => { const n = parseInt(v);   return isNaN(n) ? undefined : n; };

function write(relPath, content) {
    const full = path.join(OUT, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
    console.log('  wrote', path.relative(path.join(OUT, '..'), full));
}

function writeJSON(relPath, obj) {
    write(relPath, JSON.stringify(obj, null, 2));
}

// BIDS filename prefix for a subject/session pair
function bidsPrefix(sub, ses) {
    let p = `sub-${sub}`;
    if (ses && ses !== '') p += `_ses-${ses}`;
    return p;
}

// BIDS folder path (relative to dataset root) for a subject/session pair
function bidsFolder(sub, ses) {
    let f = `sub-${sub}/`;
    if (ses && ses !== '') f += `ses-${ses}/`;
    return f + 'emg/';
}

// ---------------------------------------------------------------------------
// Root-level files
// ---------------------------------------------------------------------------

function buildDatasetJson() {
    const d   = FORM.dataset;
    const dec = FORM.decomposition || {};
    const isSynthetic = (d.dataType || '').startsWith('synthetic');

    const generatedBy = [];
    if (isSynthetic) {
        (d.syntheticPipelines || []).forEach(p => {
            const entry = { Name: p.name || '' };
            if (p.version)     entry.Version     = p.version;
            if (p.description) entry.Description = p.description;
            if (p.codeUrl)     entry.CodeURL     = p.codeUrl;
            generatedBy.push(entry);
        });
    } else if (dec.method) {
        (dec.pipelines || []).forEach(p => {
            const entry = { Name: p.name || '' };
            if (p.version)     entry.Version     = p.version;
            if (p.description) entry.Description = p.description;
            if (p.codeUrl)     entry.CodeURL     = p.codeUrl;
            generatedBy.push(entry);
        });
        (dec.editingTools || []).forEach(p => {
            const entry = { Name: p.name || '' };
            if (p.version)     entry.Version     = p.version;
            if (p.description) entry.Description = p.description;
            if (p.codeUrl)     entry.CodeURL     = p.codeUrl;
            generatedBy.push(entry);
        });
    }

    const bids = {
        Name:               FORM.dataset.name        || '',
        BIDSVersion:        '1.11.1',
        DatasetType:        'raw',
        License:            FORM.dataset.license     || '',
        Authors:            FORM.dataset.authors     || [],
        Funding:            FORM.dataset.funding     || [],
        ReferencesAndLinks: FORM.dataset.referencesAndLinks || [],
        EthicsApprovals:    FORM.dataset.ethicsApprovals    || [],
        InstitutionName:    FORM.institution?.name    || '',
        InstitutionAddress: FORM.institution?.address || '',
    };
    generatedBy.push({
        Name:        'MUnitQuest Metadata Tool',
        Description: 'Web-based tool for generating BIDS-compliant sidecar files for HD-sEMG datasets',
        CodeURL:     'https://munitquest.github.io/metadata-form/',
    });
    bids.GeneratedBy = generatedBy;
    return bids;
}

function buildParticipantsTSV() {
    if (participantsData.length === 0) return null;
    const headers = Object.keys(participantsData[0]);
    const lines = participantsData.map(row => headers.map(h => {
        if (h === 'participant_id') {
            const v = row[h] || '';
            return v.startsWith('sub-') ? v : `sub-${v}`;
        }
        return row[h] || 'n/a';
    }).join('\t'));
    return [headers.join('\t'), ...lines].join('\n');
}

function buildParticipantsJSON() {
    return {
        participant_id: { Description: 'Unique subject identifier' },
        age:            { Description: 'Age of the participant at time of testing', Unit: 'years' },
        sex:            { Description: 'Biological sex of the participant' },
        handedness:     { Description: 'Handedness as reported by participant' },
        weight:         { Description: 'Body weight of the participant', Unit: 'kg' },
        height:         { Description: 'Body height of the participant', Unit: 'm' },
        group:          { Description: 'Experimental group the participant belongs to' },
    };
}

function buildREADME() {
    const d = FORM.dataset;
    return [
        `# ${d.name || 'Dataset'}`,
        '',
        d.description || 'Add a description of this dataset here.',
        '',
        '## License',
        d.license || '',
        '',
        '## Authors',
        (d.authors || []).join(', '),
        '',
        '## Ethics',
        (d.ethicsApprovals || []).join('\n'),
    ].join('\n');
}

// ---------------------------------------------------------------------------
// Per-recording emg.json  (placed at recording level; TaskName is specific)
// ---------------------------------------------------------------------------
function buildEMGJson(rec, setupRow) {
    const raw = {
        TaskName:                    def(rec.task_name)                              || 'n/a',
        Manufacturer:                def(setupRow.Manufacturer)                     || 'n/a',
        ManufacturersModelName:      def(setupRow.ManufacturersModelName)           || 'n/a',
        SamplingFrequency:           defNum(setupRow.SamplingFrequency)             ?? 'n/a',
        Gain:                        defNum(setupRow.Gain),
        PowerLineFrequency:          defNum(setupRow.PowerLineFrequency)            ?? 'n/a',
        RecordingType:               def(setupRow.RecordingType)                    || 'continuous',
        SoftwareFilters: {
            HighPassFilter: { HalfAmplitudeCutOffHz: defNum(setupRow.SoftwareHighPassHz) ?? 'n/a' },
            LowPassFilter:  { HalfAmplitudeCutOffHz: defNum(setupRow.SoftwareLowPassHz)  ?? 'n/a' },
        },
        HardwareFilters: (setupRow.HardwareHighPassHz || setupRow.HardwareLowPassHz) ? {
            HighPassFilter: { HalfAmplitudeCutOffHz: defNum(setupRow.HardwareHighPassHz) ?? 'n/a' },
            LowPassFilter:  { HalfAmplitudeCutOffHz: defNum(setupRow.HardwareLowPassHz)  ?? 'n/a' },
        } : undefined,
        ElectrodeManufacturer:           def(setupRow.ElectrodeManufacturer),
        ElectrodeManufacturersModelName: def(setupRow.ElectrodeManufacturersModelName),
        EMGReference:        def(setupRow.EMGReference)       || 'n/a',
        EMGPlacementScheme:  (() => { const v = def(setupRow.EMGPlacementScheme); return v ? v.charAt(0).toUpperCase() + v.slice(1) : 'n/a'; })(),
        EMGChannelCount:     defInt(setupRow.EMGChannelCount),
        TaskDescription:     def(setupRow.TaskDescription),
        Instructions:        def(setupRow.Instructions),
        InstitutionName:             def(FORM.institution?.name),
        InstitutionAddress:          def(FORM.institution?.address),
        InstitutionalDepartmentName: def(FORM.institution?.departmentName),
    };
    return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));
}

// ---------------------------------------------------------------------------
// Inherited per-setup sidecar files
// ---------------------------------------------------------------------------
function buildChannelsTSV(setupName) {
    const rows = channelsElectrodesData.filter(r =>
        r.setup === setupName && r.channel_name && r.channel_name !== 'n/a'
    );
    if (rows.length === 0) return null;
    const cols      = ['channel_name','type','units','electrode_name','reference','group','target_muscle','low_cutoff','high_cutoff'];
    const bidsNames = ['name',        'type','units','signal_electrode','reference','group','target_muscle','low_cutoff','high_cutoff'];
    const lines = rows.map(r => cols.map(c => (r[c] && r[c] !== '') ? r[c] : 'n/a').join('\t'));
    return [bidsNames.join('\t'), ...lines].join('\n');
}

function buildElectrodesTSV(setupName) {
    const rows = channelsElectrodesData.filter(r =>
        r.setup === setupName && r.electrode_name && r.electrode_name !== 'n/a'
    );
    if (rows.length === 0) return null;
    const seen = new Set();
    const unique = rows.filter(r => {
        if (seen.has(r.electrode_name)) return false;
        seen.add(r.electrode_name);
        return true;
    });
    const header = 'name\tx\ty\tz\tcoordinate_system\ttype\tmaterial\timpedance\tgroup';
    const lines = unique.map(r => [
        r.electrode_name, r.x, r.y, r.z,
        r.coordinate_system, r.type, r.material, r.impedance, r.group,
    ].map(v => (v && v !== '') ? v : 'n/a').join('\t'));
    return [header, ...lines].join('\n');
}

// Returns { spaceName: jsonObject } — one entry per coordinate system row (anatomical + grids).
// Each grid gets its own space-{name}_coordsystem.json with top-level ParentCoordinateSystem,
// AnchorElectrode, AnchorCoordinates fields per the BIDS EMG spec.
function buildCoordsystemJSONs(setupName) {
    const rows = coordsystemsData.filter(r => r.setup === setupName);
    if (rows.length === 0) return {};

    const result = {};
    for (const row of rows) {
        const json = {
            EMGCoordinateSystem: 'Other',
            EMGCoordinateUnits:  row.units,
        };
        if (row.description)         json.EMGCoordinateSystemDescription = row.description;
        if (row.parent_coord_system) json.ParentCoordinateSystem = row.parent_coord_system;
        if (row.anchor_electrode)    json.AnchorElectrode = row.anchor_electrode;
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
console.log('\n=== Generating BIDS metadata ===\n');

// Root-level files
writeJSON('dataset_description.json', buildDatasetJson());
write('README.md', buildREADME());
const ptsTSV = buildParticipantsTSV();
if (ptsTSV) write('participants.tsv', ptsTSV);
writeJSON('participants.json', buildParticipantsJSON());

// Group recordings by (sub, ses) — each group shares one setup
const groups = {};
for (const rec of recordingsData) {
    const key = `${rec.sub}|||${rec.ses || ''}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(rec);
}

for (const [key, recs] of Object.entries(groups)) {
    const [sub, ses] = key.split('|||');
    const folder     = bidsFolder(sub, ses);
    const prefix     = bidsPrefix(sub, ses);

    // All recordings in this group should share one setup (warn if mixed)
    const setups = [...new Set(recs.map(r => r.setup).filter(Boolean))];
    if (setups.length > 1) {
        console.warn(`  WARNING: sub-${sub}${ses ? '/ses-' + ses : ''} uses multiple setups (${setups.join(', ')}). Inheriting from first setup.`);
    }
    const setupName = setups[0];
    const setupRow  = setupData.find(r => r.setup_name === setupName) || {};

    // Inherited sidecar files (electrodes + coordsystem only — one per sub/ses)
    const elTSV = buildElectrodesTSV(setupName);
    if (elTSV) write(`${folder}${prefix}_electrodes.tsv`, elTSV);

    const coordJSONs = buildCoordsystemJSONs(setupName);
    for (const [coordName, coordJSON] of Object.entries(coordJSONs)) {
        writeJSON(`${folder}${prefix}_space-${coordName}_coordsystem.json`, coordJSON);
    }

    // Per-recording emg.json + channels.tsv
    for (const rec of recs) {
        let recPrefix = `${prefix}_task-${rec.task_name}`;
        if (rec.run && rec.run !== '') recPrefix += `_run-${String(parseInt(rec.run)).padStart(2, '0')}`;
        writeJSON(`${folder}${recPrefix}_emg.json`, buildEMGJson(rec, setupRow));
        const chTSV = buildChannelsTSV(setupName);
        if (chTSV) write(`${folder}${recPrefix}_channels.tsv`, chTSV);
    }
}

// Zip the staged files and clean up
if (fs.existsSync(ZIP_OUT)) fs.rmSync(ZIP_OUT);
execSync(`cd "${TEMP_DIR}" && zip -r "${ZIP_OUT}" .`, { stdio: 'pipe' });
fs.rmSync(TEMP_DIR, { recursive: true });
console.log(`\nDone. Metadata zip: ${ZIP_OUT}\n`);
