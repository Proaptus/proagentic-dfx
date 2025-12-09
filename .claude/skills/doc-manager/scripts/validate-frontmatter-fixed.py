#!/usr/bin/env python3
"""
validate-frontmatter-fixed.py - Validate YAML front matter against JSON Schema
Fixed version that handles YAML dates and Unicode issues
"""

import sys
import re
import json
import yaml
from pathlib import Path
from datetime import date
from jsonschema import validate, ValidationError, SchemaError

def extract_frontmatter(file_path):
    """Extract YAML front matter from a Markdown file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Match YAML front matter (between --- markers)
        match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if not match:
            return None

        yaml_content = match.group(1)
        fm = yaml.safe_load(yaml_content)
        
        # Convert date objects to ISO strings
        if fm and isinstance(fm, dict):
            for key in ['last_verified_at', 'test_date', 'date']:
                if key in fm and isinstance(fm[key], date):
                    fm[key] = fm[key].isoformat()
        
        return fm

    except Exception as e:
        print(f"ERROR: Failed to parse {file_path}: {e}")
        return None

def load_schema():
    """Load JSON Schema from templates directory."""
    script_dir = Path(__file__).parent
    skill_dir = script_dir.parent
    schema_path = skill_dir / 'templates' / 'frontmatter-schema.json'

    if not schema_path.exists():
        print(f"ERROR: Schema file not found: {schema_path}")
        sys.exit(1)

    with open(schema_path, 'r') as f:
        return json.load(f)

def validate_file(file_path, schema):
    """Validate a single file's front matter."""
    frontmatter = extract_frontmatter(file_path)

    if frontmatter is None:
        return {
            'path': str(file_path),
            'valid': False,
            'error': 'Missing front matter'
        }

    try:
        validate(instance=frontmatter, schema=schema)
        return {
            'path': str(file_path),
            'valid': True
        }

    except ValidationError as e:
        field = '.'.join(str(p) for p in e.path) if e.path else 'unknown'
        return {
            'path': str(file_path),
            'valid': False,
            'error': e.message,
            'field': field
        }

    except SchemaError as e:
        return {
            'path': str(file_path),
            'valid': False,
            'error': f"Schema error: {e.message}"
        }

def find_markdown_files(path):
    """Find all Markdown files in path, excluding CLAUDE.md."""
    path_obj = Path(path)

    if path_obj.is_file():
        if path_obj.name == 'CLAUDE.md':
            return []
        return [path_obj]

    # Recursively find all .md files
    md_files = []
    for md_file in path_obj.rglob('*.md'):
        if md_file.name != 'CLAUDE.md' and '.git' not in str(md_file):
            md_files.append(md_file)

    return sorted(md_files)

def main():
    """Main validation function."""
    import argparse

    parser = argparse.ArgumentParser(description='Validate YAML front matter')
    parser.add_argument('path', nargs='?', default='docs/',
                        help='File or directory to validate (default: docs/)')
    parser.add_argument('--json', action='store_true',
                        help='Output results as JSON')
    args = parser.parse_args()

    # Load schema
    schema = load_schema()
    print(f"INFO: Loaded schema: {schema.get('title', 'Unknown')}")

    # Find files
    files = find_markdown_files(args.path)
    print(f"INFO: Found {len(files)} Markdown files")

    # Validate each file
    results = []
    valid_count = 0
    invalid_count = 0

    for file_path in files:
        result = validate_file(file_path, schema)
        results.append(result)
        
        if result['valid']:
            valid_count += 1
            print(f"VALID: {result['path']}")
        else:
            invalid_count += 1
            print(f"ERROR: {result['path']}: {result['error']}")
            if 'field' in result:
                print(f"  Field: {result['field']}")

    # Summary
    print("\n" + "="*60)
    print("VALIDATION SUMMARY")
    print("="*60)
    print(f"Total files: {len(files)}")
    print(f"Valid: {valid_count}")
    print(f"Invalid: {invalid_count}")
    
    if args.json:
        output = {
            'validated_at': __import__('datetime').datetime.utcnow().isoformat() + 'Z',
            'total_docs': len(files),
            'valid': valid_count,
            'errors': invalid_count,
            'issues': [r for r in results if not r['valid']]
        }
        print("\n" + json.dumps(output, indent=2))

    # Exit code
    sys.exit(0 if invalid_count == 0 else 1)

if __name__ == '__main__':
    main()
