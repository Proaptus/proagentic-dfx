#!/usr/bin/env python3
"""
generate-manifest.py - Generate manifest.json from all documentation

Usage:
    python3 generate-manifest.py [--output PATH]
"""

import json
import re
import yaml
from pathlib import Path
from datetime import datetime

def extract_frontmatter(file_path):
    """Extract YAML front matter from Markdown file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if not match:
            return None

        return yaml.safe_load(match.group(1))
    except Exception:
        return None

def find_docs(docs_dir):
    """Find all documented files with valid front matter."""
    docs = []
    docs_path = Path(docs_dir)

    if not docs_path.exists():
        return docs

    for md_file in docs_path.rglob('*.md'):
        if md_file.name == 'CLAUDE.md' or 'quarantine' in str(md_file):
            continue

        frontmatter = extract_frontmatter(md_file)
        if frontmatter:
            docs.append({
                'path': str(md_file.relative_to(docs_path.parent)),
                'frontmatter': frontmatter
            })

    return docs

def generate_manifest(docs):
    """Generate manifest from documentation."""
    manifest = {
        'generated_at': datetime.utcnow().isoformat() + 'Z',
        'total_docs': len(docs),
        'by_type': {},
        'by_status': {},
        'features': [],
        'adrs': [],
        'howtos': [],
        'references': [],
        'explanations': []
    }

    for doc in docs:
        fm = doc['frontmatter']
        doc_type = fm.get('doc_type', 'unknown')
        status = fm.get('status', 'unknown')

        # Count by type
        manifest['by_type'][doc_type] = manifest['by_type'].get(doc_type, 0) + 1

        # Count by status
        manifest['by_status'][status] = manifest['by_status'].get(status, 0) + 1

        # Add to appropriate category
        last_verified = fm.get('last_verified_at')
        if hasattr(last_verified, 'isoformat'):
            last_verified = last_verified.isoformat()

        entry = {
            'id': fm.get('id'),
            'title': fm.get('title'),
            'path': doc['path'],
            'status': status,
            'last_verified_at': last_verified,
            'owner': fm.get('owner'),
            'code_refs': fm.get('code_refs', []),
            'test_refs': fm.get('test_refs', []),
            'evidence': fm.get('evidence', {}),
            'search': fm.get('search', {})
        }

        if doc_type == 'feature':
            manifest['features'].append(entry)
        elif doc_type == 'adr':
            manifest['adrs'].append(entry)
        elif doc_type == 'howto':
            manifest['howtos'].append(entry)
        elif doc_type == 'reference':
            manifest['references'].append(entry)
        elif doc_type == 'explanation':
            manifest['explanations'].append(entry)

    return manifest

def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(description='Generate manifest.json')
    parser.add_argument('--output', default='docs/_index/manifest.json',
                        help='Output file path (default: docs/_index/manifest.json)')
    args = parser.parse_args()

    # Find docs
    docs = find_docs('docs/')
    print(f"Found {len(docs)} documents with front matter")

    # Generate manifest
    manifest = generate_manifest(docs)

    # Create output directory if needed
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write manifest
    with open(output_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"Manifest generated: {output_path}")
    print(f"  Total docs: {manifest['total_docs']}")
    print(f"  Features: {len(manifest['features'])}")
    print(f"  ADRs: {len(manifest['adrs'])}")
    print(f"  How-Tos: {len(manifest['howtos'])}")

if __name__ == '__main__':
    main()
