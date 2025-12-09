import csv
from difflib import SequenceMatcher
from collections import defaultdict

def similarity(a, b):
    """Calculate similarity ratio between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def analyze_duplicates(csv_path, threshold=0.85):
    """
    Analyze RTM for duplicate requirements
    threshold: similarity ratio (0-1) for considering requirements as duplicates
    """
    requirements = []

    # Read CSV
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            requirements.append({
                'id': row['Req_ID'],
                'category': row['Category'],
                'description': row['Requirement_Description'],
                'screen': row.get('Screen_Location', ''),
                'api': row.get('API_Endpoint', ''),
                'status': row.get('Status_in_Frontend_Plan', '')
            })

    duplicates = []
    checked = set()

    # Compare all pairs
    for i, req1 in enumerate(requirements):
        if req1['id'] in checked:
            continue

        similar_group = [req1]

        for j, req2 in enumerate(requirements[i+1:], start=i+1):
            if req2['id'] in checked:
                continue

            # Calculate similarity
            sim = similarity(req1['description'], req2['description'])

            if sim >= threshold:
                similar_group.append(req2)
                checked.add(req2['id'])

        if len(similar_group) > 1:
            duplicates.append(similar_group)
            checked.add(req1['id'])

    # Also check for exact substring matches
    desc_to_reqs = defaultdict(list)
    for req in requirements:
        desc_to_reqs[req['description'].strip()].append(req)

    exact_duplicates = [reqs for reqs in desc_to_reqs.values() if len(reqs) > 1]

    # Check for same API endpoint with different descriptions
    api_groups = defaultdict(list)
    for req in requirements:
        api = req['api'].strip()
        if api and api != 'N/A' and api != 'N/A (Frontend only)':
            api_groups[api].append(req)

    overlapping_apis = {api: reqs for api, reqs in api_groups.items() if len(reqs) > 5}

    # Check for same screen location with very similar functionality
    screen_groups = defaultdict(list)
    for req in requirements:
        screen = req['screen'].strip()
        if screen and 'Screen' in screen:
            screen_groups[screen].append(req)

    return {
        'similar_descriptions': duplicates,
        'exact_duplicates': exact_duplicates,
        'api_overlaps': overlapping_apis,
        'screen_groups': screen_groups
    }

def print_report(results):
    """Print formatted duplicate analysis report"""

    print("=" * 80)
    print("DUPLICATE REQUIREMENTS ANALYSIS REPORT")
    print("=" * 80)
    print()

    # Exact duplicates
    if results['exact_duplicates']:
        print("1. EXACT DUPLICATE DESCRIPTIONS")
        print("-" * 80)
        for i, group in enumerate(results['exact_duplicates'], 1):
            print(f"\nGroup {i}:")
            print(f"  Description: {group[0]['description']}")
            print(f"  Duplicate IDs: {', '.join(r['id'] for r in group)}")
            print(f"  Categories: {', '.join(set(r['category'] for r in group))}")
            print(f"  Recommendation: MERGE - These are identical requirements")
        print()
    else:
        print("1. EXACT DUPLICATE DESCRIPTIONS: None found\n")

    # Similar descriptions
    if results['similar_descriptions']:
        print("2. HIGHLY SIMILAR REQUIREMENTS (85%+ match)")
        print("-" * 80)
        for i, group in enumerate(results['similar_descriptions'], 1):
            print(f"\nGroup {i}:")
            for req in group:
                print(f"  {req['id']}: {req['description'][:80]}...")
            categories = set(r['category'] for r in group)
            print(f"  Categories: {', '.join(categories)}")
            print(f"  Screens: {', '.join(set(r['screen'] for r in group if r['screen']))}")

            if len(categories) == 1:
                print(f"  Recommendation: MERGE - Same category, nearly identical descriptions")
            else:
                print(f"  Recommendation: REVIEW - Different categories, verify if truly separate concerns")
        print()
    else:
        print("2. HIGHLY SIMILAR REQUIREMENTS: None found\n")

    # API endpoint overlaps
    if results['api_overlaps']:
        print("3. POTENTIAL SCOPE OVERLAPS (Same API endpoint, many requirements)")
        print("-" * 80)
        for api, reqs in results['api_overlaps'].items():
            print(f"\nAPI: {api}")
            print(f"  Number of requirements: {len(reqs)}")
            print(f"  Requirement IDs: {', '.join(r['id'] for r in reqs[:10])}")
            if len(reqs) > 10:
                print(f"  ... and {len(reqs) - 10} more")
            print(f"  Recommendation: REVIEW - Ensure these are distinct features, not duplicate specs")
        print()

    # Screen location clustering
    heavy_screens = {s: r for s, r in results['screen_groups'].items() if len(r) > 15}
    if heavy_screens:
        print("4. SCREEN LOCATION CLUSTERS (Potential overlapping UI requirements)")
        print("-" * 80)
        for screen, reqs in heavy_screens.items():
            print(f"\n{screen}: {len(reqs)} requirements")
            categories = defaultdict(int)
            for r in reqs:
                categories[r['category']] += 1
            print(f"  Category breakdown: {dict(categories)}")
            print(f"  Recommendation: REVIEW - Verify all requirements represent distinct UI elements")
        print()

if __name__ == "__main__":
    csv_path = r"C:\Users\chine\Projects\proagentic-dfx\requirements_spec\requirements-traceability-matrix.csv"
    results = analyze_duplicates(csv_path, threshold=0.85)
    print_report(results)
