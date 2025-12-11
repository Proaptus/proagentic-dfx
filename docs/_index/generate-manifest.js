const fs = require('fs');
const path = require('path');

const VALID_DOC_TYPES = new Set(['feature', 'howto', 'reference', 'explanation', 'adr', 'test_report', 'test-report', 'runbook']);
const VALID_STATUSES = new Set(['draft', 'proposed', 'accepted', 'deprecated', 'superseded']);

function parseYamlFrontmatter(content) {
    if (content.startsWith('\ufeff')) content = content.slice(1);
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return null;
    const yaml = match[1];
    const frontmatter = {};
    for (const line of yaml.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const keyMatch = trimmed.match(/^([a-z_]+):\s*(.*)?$/);
        if (keyMatch) {
            const key = keyMatch[1];
            let value = (keyMatch[2] || '').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
            if (value.startsWith('[') && value.endsWith(']')) {
                const items = value.slice(1, -1);
                frontmatter[key] = items ? items.split(',').map(s => s.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')) : [];
            } else if (value) {
                frontmatter[key] = value;
            }
        }
    }
    return frontmatter;
}

function validateFrontmatter(filePath, fm) {
    const issues = [];
    if (!fm) {
        issues.push({ path: filePath, severity: 'error', field: 'frontmatter', message: 'Missing YAML front matter' });
        return issues;
    }
    const required = ['doc_type', 'title', 'status'];
    const recommended = ['id', 'owner', 'last_verified_at'];
    for (const field of required) {
        if (!(field in fm)) {
            issues.push({ path: filePath, severity: 'error', field, message: `Missing required field: ${field}` });
        }
    }
    for (const field of recommended) {
        if (!(field in fm)) {
            issues.push({ path: filePath, severity: 'warning', field, message: `Missing recommended field: ${field}` });
        }
    }
    if (fm.doc_type && !VALID_DOC_TYPES.has(fm.doc_type)) {
        issues.push({ path: filePath, severity: 'error', field: 'doc_type', message: `Invalid doc_type: ${fm.doc_type}` });
    }
    if (fm.status && !VALID_STATUSES.has(fm.status)) {
        issues.push({ path: filePath, severity: 'error', field: 'status', message: `Invalid status: ${fm.status}` });
    }
    if (fm.status === 'superseded' && !fm.superseded_by) {
        issues.push({ path: filePath, severity: 'warning', field: 'superseded_by', message: 'superseded status without superseded_by' });
    }
    return issues;
}

function walkDir(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    for (const item of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath, files);
        } else if (item.endsWith('.md') && item !== 'CLAUDE.md') {
            files.push(fullPath);
        }
    }
    return files;
}

const baseDir = 'docs';
const targetDirs = ['reference', 'test-report', 'howto', 'runbook', 'explanation'];
const allDocs = [];
const allIssues = [];

for (const targetDir of targetDirs) {
    const dirPath = path.join(baseDir, targetDir);
    const files = walkDir(dirPath);
    for (const filePath of files) {
        const relPath = filePath.split(String.fromCharCode(92)).join('/');
        const content = fs.readFileSync(filePath, 'utf-8');
        const fm = parseYamlFrontmatter(content);
        const issues = validateFrontmatter(relPath, fm);
        allIssues.push(...issues);
        if (fm) {
            let docType = fm.doc_type || '';
            if (docType === 'test-report') docType = 'test_report';
            allDocs.push({
                id: fm.id || '',
                path: relPath,
                title: fm.title || '',
                doc_type: docType,
                status: fm.status || 'draft',
                last_verified_at: String(fm.last_verified_at || ''),
                owner: fm.owner || ''
            });
        }
    }
}

const statusCounts = {};
const typeCounts = {};
for (const doc of allDocs) {
    statusCounts[doc.status] = (statusCounts[doc.status] || 0) + 1;
    typeCounts[doc.doc_type] = (typeCounts[doc.doc_type] || 0) + 1;
}

const errors = allIssues.filter(i => i.severity === 'error');
const warnings = allIssues.filter(i => i.severity === 'warning');
const errorPaths = new Set(errors.map(e => e.path));

const manifest = {
    generated_at: new Date().toISOString(),
    total_documents: allDocs.length,
    valid_documents: allDocs.length - errorPaths.size,
    by_status: statusCounts,
    by_type: typeCounts,
    validation: {
        errors: errors.length,
        warnings: warnings.length,
        issues: allIssues
    },
    documents: allDocs.sort((a, b) => a.path.localeCompare(b.path))
};

const manifestPath = path.join(baseDir, '_index', 'manifest.json');
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('Manifest generated:', manifestPath);
console.log('');
console.log('Validation Summary:');
console.log('  Total Documents:', allDocs.length);
console.log('  Valid:', manifest.valid_documents);
console.log('  Errors:', errors.length);
console.log('  Warnings:', warnings.length);
console.log('');
console.log('By Status:');
for (const [status, count] of Object.entries(statusCounts).sort()) {
    console.log(`  ${status}: ${count}`);
}
console.log('');
console.log('By Type:');
for (const [docType, count] of Object.entries(typeCounts).sort()) {
    console.log(`  ${docType}: ${count}`);
}
