#!/usr/bin/env python3
"""
validate-frontmatter.py - Validate YAML front matter against JSON Schema

Usage:
    python3 validate-frontmatter.py [file_or_directory] [--strict]
"""

import sys
import re
import json
import yaml
from pathlib import Path
from jsonschema import validate, ValidationError, SchemaError

# ANSI colors
RED = '\033[0;31m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'  # No Color

def log_info(msg):
    print(f"{BLUE}[INFO]{NC} {msg}")

def log_success(msg):
    print(f"{GREEN}✓{NC} {msg}")

def log_warning(msg):
    print(f"{YELLOW}⚠{NC} {msg}")

def log_error(msg):
    print(f"{RED}✗{NC} {msg}")

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
        return yaml.safe_load(yaml_content)

    except Exception as e:
        log_error(f"Failed to parse {file_path}: {e}")
        return None

def load_schema():
    """Load JSON Schema from templates directory."""
    script_dir = Path(__file__).parent
    skill_dir = script_dir.parent
    schema_path = skill_dir / 'templates' / 'frontmatter-schema.json'

    if not schema_path.exists():
        log_error(f"Schema file not found: {schema_path}")
        sys.exit(1)

    with open(schema_path, 'r') as f:
        return json.load(f)

def validate_file(file_path, schema, strict=False):
    """Validate a single file's front matter."""
    frontmatter = extract_frontmatter(file_path)

    if frontmatter is None:
        if strict:
            log_error(f"{file_path}: Missing front matter")
            return False
        else:
            log_warning(f"{file_path}: No front matter found")
            return True

    try:
        validate(instance=frontmatter, schema=schema)
        log_success(f"{file_path}: Valid")
        return True

    except ValidationError as e:
        log_error(f"{file_path}: {e.message}")
        if e.path:
            log_error(f"  Field: {'.'.join(str(p) for p in e.path)}")
        return False

    except SchemaError as e:
        log_error(f"Schema error: {e.message}")
        return False

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
    parser.add_argument('--strict', action='store_true',
                        help='Fail on missing front matter')
    args = parser.parse_args()

    # Load schema
    schema = load_schema()
    log_info(f"Loaded schema: {schema.get('title', 'Unknown')}")

    # Find files
    files = find_markdown_files(args.path)
    log_info(f"Found {len(files)} Markdown files")

    # Validate each file
    valid_count = 0
    invalid_count = 0

    for file_path in files:
        if validate_file(file_path, schema, args.strict):
            valid_count += 1
        else:
            invalid_count += 1

    # Summary
    print()
    log_info("=" * 50)
    log_info("Validation Summary:")
    log_success(f"Valid: {valid_count}")
    if invalid_count > 0:
        log_error(f"Invalid: {invalid_count}")
    log_info("=" * 50)

    # Exit code
    sys.exit(0 if invalid_count == 0 else 1)

if __name__ == '__main__':
    main()
