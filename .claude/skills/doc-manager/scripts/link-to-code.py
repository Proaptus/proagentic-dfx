#!/usr/bin/env python3
"""
link-to-code.py - Find and add code/test references to documentation

Usage:
    python3 link-to-code.py [file_or_directory] [--dry-run]
"""

import re
import yaml
from pathlib import Path

def extract_frontmatter(file_path):
    """Extract YAML front matter."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if not match:
        return None, content

    frontmatter = yaml.safe_load(match.group(1))
    body = match.group(2)
    return frontmatter, body

def find_code_references(doc_path, project_root):
    """Find potential code references for a document."""
    # Simple heuristic: look for files mentioned in doc
    code_refs = []
    test_refs = []

    try:
        with open(doc_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find file references (e.g., src/file.ts, tests/file.test.ts)
        file_pattern = r'((?:src|server|tests)/[\w/.-]+\.(?:ts|tsx|js|jsx|py))'
        matches = re.findall(file_pattern, content)

        for match in set(matches):
            file_path = project_root / match
            if file_path.exists():
                if '/tests/' in match or '.test.' in match or '.spec.' in match:
                    test_refs.append({'path': match})
                else:
                    code_refs.append({'path': match})

    except Exception as e:
        print(f"Error processing {doc_path}: {e}")

    return code_refs, test_refs

def update_frontmatter(doc_path, code_refs, test_refs, dry_run=False):
    """Update document front matter with code and test refs."""
    frontmatter, body = extract_frontmatter(doc_path)

    if frontmatter is None:
        print(f"Skipping {doc_path}: No front matter found")
        return

    # Add code_refs if not present
    if code_refs and 'code_refs' not in frontmatter:
        frontmatter['code_refs'] = code_refs

    # Add test_refs if not present
    if test_refs and 'test_refs' not in frontmatter:
        frontmatter['test_refs'] = test_refs

    if dry_run:
        print(f"[DRY RUN] Would update {doc_path}")
        if code_refs:
            print(f"  code_refs: {len(code_refs)} files")
        if test_refs:
            print(f"  test_refs: {len(test_refs)} files")
        return

    # Write updated front matter
    with open(doc_path, 'w', encoding='utf-8') as f:
        f.write('---\n')
        yaml.dump(frontmatter, f, default_flow_style=False, sort_keys=False)
        f.write('---\n')
        f.write(body)

    print(f"Updated {doc_path}")

def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(description='Link docs to code and tests')
    parser.add_argument('path', nargs='?', default='docs/',
                        help='File or directory (default: docs/)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Preview changes without applying')
    args = parser.parse_args()

    project_root = Path.cwd()
    path_obj = Path(args.path)

    # Find Markdown files
    if path_obj.is_file():
        files = [path_obj]
    else:
        files = list(path_obj.rglob('*.md'))

    print(f"Processing {len(files)} files...")

    for doc_path in files:
        if doc_path.name == 'CLAUDE.md':
            continue

        code_refs, test_refs = find_code_references(doc_path, project_root)

        if code_refs or test_refs:
            update_frontmatter(doc_path, code_refs, test_refs, args.dry_run)

if __name__ == '__main__':
    main()
