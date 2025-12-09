#!/usr/bin/env python3
import sys, re, json, yaml
from pathlib import Path
from datetime import date, datetime

def extract_frontmatter(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if not match:
            return None
        yaml_content = match.group(1)
        fm = yaml.safe_load(yaml_content)
        if fm and isinstance(fm, dict):
            for key in ['last_verified_at', 'test_date', 'date']:
                if key in fm and isinstance(fm[key], date):
                    fm[key] = fm[key].isoformat()
        return fm
    except:
        return None

def find_markdown_files(path):
    path_obj = Path(path)
    md_files = []
    for md_file in path_obj.rglob('*.md'):
        if md_file.name != 'CLAUDE.md' and '.git' not in str(md_file) and '__pycache__' not in str(md_file):
            md_files.append(md_file)
    return sorted(md_files)

def create_document_entry(file_path, base_path, frontmatter):
    rel_path = str(file_path.relative_to(base_path))
    rel_path = rel_path.replace(chr(92), '/')
    entry = {'path': rel_path}
    
    if frontmatter:
        entry['id'] = frontmatter.get('id', 'UNKNOWN')
        entry['title'] = frontmatter.get('title', file_path.stem)
        entry['doc_type'] = frontmatter.get('doc_type', 'unknown')
        entry['status'] = frontmatter.get('status', 'draft')
        entry['last_verified_at'] = frontmatter.get('last_verified_at', '')
        entry['owner'] = frontmatter.get('owner', '@unknown')
        if 'keywords' in frontmatter:
            entry['keywords'] = frontmatter['keywords']
        if 'code_refs' in frontmatter and frontmatter['code_refs']:
            entry['code_refs_count'] = len(frontmatter['code_refs'])
    else:
        entry['id'] = 'NO-FRONTMATTER'
        entry['title'] = file_path.stem
        entry['doc_type'] = 'unclassified'
        entry['status'] = 'draft'
        entry['owner'] = '@unknown'
    
    return entry

def main():
    base_path = Path('/c/Users/chine/Projects/proagentic-dfx')
    docs_path = base_path / 'docs'
    
    files = find_markdown_files(docs_path)
    print(f"Found {len(files)} markdown files")
    
    documents = []
    by_status = {}
    by_type = {}
    by_directory = {}
    
    for file_path in files:
        fm = extract_frontmatter(file_path)
        entry = create_document_entry(file_path, docs_path, fm)
        documents.append(entry)
        
        status = entry['status']
        doc_type = entry['doc_type']
        directory = entry['path'].split('/')[0]
        
        by_status[status] = by_status.get(status, 0) + 1
        by_type[doc_type] = by_type.get(doc_type, 0) + 1
        if directory not in by_directory:
            by_directory[directory] = []
        by_directory[directory].append(entry['path'])
    
    manifest = {
        'version': '1.0.0',
        'generated_at': datetime.utcnow().isoformat() + 'Z',
        'generator': 'doc-manager skill (Phase 7 validation)',
        'project': 'ProAgentic DfX',
        'total_documents': len(documents),
        'documents': documents,
        'statistics': {
            'by_status': by_status,
            'by_type': by_type,
            'by_directory': {k: len(v) for k, v in by_directory.items()},
            'with_frontmatter': len([d for d in documents if d['id'] != 'NO-FRONTMATTER']),
            'without_frontmatter': len([d for d in documents if d['id'] == 'NO-FRONTMATTER'])
        }
    }
    
    manifest_path = base_path / 'docs' / '_index' / 'manifest.json'
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"Generated manifest")
    print(json.dumps(manifest['statistics'], indent=2))

if __name__ == '__main__':
    main()
