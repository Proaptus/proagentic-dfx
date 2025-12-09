import csv
from difflib import SequenceMatcher

def read_requirements(csv_path):
    """Read all requirements from CSV"""
    requirements = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            requirements.append(row)
    return requirements

def find_functional_duplicates(requirements):
    """Find specific functional duplicates"""

    duplicates = []

    # Pattern 1: CAD/Geometry duplicates (frontend vs backend)
    cad_pairs = [
        ('REQ-216', 'REQ-323'),  # Parametric geometry updates
        ('REQ-220', 'REQ-320'),  # Multi-body assembly
        ('REQ-212', 'REQ-311'),  # B-rep solid modeling (OpenCascade vs Truck)
        ('REQ-214', 'REQ-314'),  # STEP export
        ('REQ-213', 'REQ-313'),  # STEP import
    ]

    for id1, id2 in cad_pairs:
        req1 = next((r for r in requirements if r['Req_ID'] == id1), None)
        req2 = next((r for r in requirements if r['Req_ID'] == id2), None)
        if req1 and req2:
            duplicates.append({
                'type': 'Frontend/Backend Split',
                'ids': [id1, id2],
                'desc': req1['Requirement_Description'],
                'categories': [req1['Category'], req2['Category']],
                'recommendation': 'CLARIFY - One is frontend implementation, one is backend. Consider merging or explicitly noting the layer difference.'
            })

    # Pattern 2: Surrogate model duplicates
    surrogate_groups = []
    stress_reqs = [r for r in requirements if 'stress' in r['Requirement_Description'].lower() and r['Category'] in ['FEA-Results', 'Physics-SCF', 'Physics-Core', 'Simulator']]

    # Check for stress calculation duplicates
    stress_calc_reqs = []
    for r in requirements:
        desc_lower = r['Requirement_Description'].lower()
        if 'hoop stress' in desc_lower and 'calculation' in desc_lower:
            stress_calc_reqs.append(r['Req_ID'])

    if len(stress_calc_reqs) > 1:
        duplicates.append({
            'type': 'Calculation Duplicate',
            'ids': stress_calc_reqs,
            'desc': 'Hoop stress calculation',
            'categories': list(set([r['Category'] for r in requirements if r['Req_ID'] in stress_calc_reqs])),
            'recommendation': 'MERGE - Multiple requirements for same physics calculation'
        })

    # Pattern 3: Export duplicates
    step_export_reqs = [r for r in requirements if 'STEP' in r['Requirement_Description'] and 'export' in r['Requirement_Description'].lower()]
    if len(step_export_reqs) > 1:
        duplicates.append({
            'type': 'Export Duplicate',
            'ids': [r['Req_ID'] for r in step_export_reqs],
            'desc': 'STEP file export',
            'categories': list(set([r['Category'] for r in step_export_reqs])),
            'recommendation': 'MERGE - Same export functionality described in multiple places'
        })

    # Pattern 4: Optimization progress tracking duplicates
    opt_progress = [r for r in requirements if 'optimization' in r['Requirement_Description'].lower() and 'progress' in r['Requirement_Description'].lower()]
    if len(opt_progress) > 1:
        duplicates.append({
            'type': 'UI Progress Duplicate',
            'ids': [r['Req_ID'] for r in opt_progress],
            'desc': 'Optimization progress display',
            'categories': list(set([r['Category'] for r in opt_progress])),
            'recommendation': 'REVIEW - Ensure each requirement covers a distinct aspect of progress tracking'
        })

    # Pattern 5: Mesh/Tessellation duplicates
    mesh_reqs = [r for r in requirements if 'mesh' in r['Requirement_Description'].lower() or 'tessellation' in r['Requirement_Description'].lower()]
    if len(mesh_reqs) > 2:
        duplicates.append({
            'type': 'Mesh/Visualization Duplicate',
            'ids': [r['Req_ID'] for r in mesh_reqs],
            'desc': 'Mesh and tessellation',
            'categories': list(set([r['Category'] for r in mesh_reqs])),
            'recommendation': 'REVIEW - Multiple mesh-related requirements, verify distinct purposes'
        })

    # Pattern 6: Reliability/Monte Carlo duplicates
    mc_reqs = [r for r in requirements if 'monte carlo' in r['Requirement_Description'].lower()]
    if len(mc_reqs) > 1:
        duplicates.append({
            'type': 'Monte Carlo Duplicate',
            'ids': [r['Req_ID'] for r in mc_reqs],
            'desc': 'Monte Carlo reliability analysis',
            'categories': list(set([r['Category'] for r in mc_reqs])),
            'recommendation': 'MERGE - Same Monte Carlo functionality'
        })

    # Pattern 7: Standards compliance duplicates
    compliance_reqs = [r for r in requirements if 'compliance' in r['Requirement_Description'].lower() and 'standards' in r['Requirement_Description'].lower()]
    if len(compliance_reqs) > 1:
        duplicates.append({
            'type': 'Compliance Checker Duplicate',
            'ids': [r['Req_ID'] for r in compliance_reqs],
            'desc': 'Standards compliance checking',
            'categories': list(set([r['Category'] for r in compliance_reqs])),
            'recommendation': 'REVIEW - May be distinct (display vs engine vs generic), verify separation'
        })

    return duplicates

def find_data_mode_confusion(requirements):
    """Find requirements with inconsistent Data_Mode specifications"""
    issues = []

    # Group by API endpoint
    from collections import defaultdict
    api_groups = defaultdict(list)
    for r in requirements:
        api = r.get('API_Endpoint', '').strip()
        if api and api not in ['N/A', 'N/A (Frontend only)']:
            api_groups[api].append(r)

    # Check for inconsistent data modes on same endpoint
    for api, reqs in api_groups.items():
        data_modes = set([r.get('Data_Mode', '').strip() for r in reqs if r.get('Data_Mode', '').strip()])
        if len(data_modes) > 1 and 'N/A' not in data_modes:
            issues.append({
                'api': api,
                'ids': [r['Req_ID'] for r in reqs],
                'modes': list(data_modes),
                'recommendation': 'CLARIFY - Same API endpoint with different data modes'
            })

    return issues

def main():
    csv_path = r"C:\Users\chine\Projects\proagentic-dfx\requirements_spec\requirements-traceability-matrix.csv"
    requirements = read_requirements(csv_path)

    print("=" * 100)
    print("DETAILED DUPLICATE AND OVERLAP ANALYSIS")
    print("=" * 100)
    print()

    # Functional duplicates
    func_dups = find_functional_duplicates(requirements)

    print("FUNCTIONAL DUPLICATES AND OVERLAPS")
    print("-" * 100)
    print()

    for i, dup in enumerate(func_dups, 1):
        print(f"{i}. {dup['type']}")
        print(f"   IDs: {', '.join(dup['ids'])}")
        print(f"   Description: {dup['desc']}")
        print(f"   Categories: {', '.join(dup['categories'])}")
        print(f"   Recommendation: {dup['recommendation']}")
        print()

    # Data mode issues
    mode_issues = find_data_mode_confusion(requirements)

    if mode_issues:
        print("\nDATA MODE INCONSISTENCIES")
        print("-" * 100)
        print()

        for issue in mode_issues:
            print(f"API: {issue['api']}")
            print(f"   Requirements: {', '.join(issue['ids'][:5])}" + (f" ... and {len(issue['ids'])-5} more" if len(issue['ids']) > 5 else ""))
            print(f"   Data Modes: {', '.join(issue['modes'])}")
            print(f"   {issue['recommendation']}")
            print()

    # Specific known duplicates to check
    print("\nKNOWN DUPLICATE PAIRS TO VERIFY")
    print("-" * 100)
    print()

    known_pairs = [
        ('REQ-023', 'REQ-353', 'Netting theory initial sizing'),
        ('REQ-130', 'REQ-359', 'Requirements to Pareto timing target'),
        ('REQ-186', 'REQ-187', 'Backend schema matching'),
        ('REQ-076', 'REQ-160', 'Monte Carlo simulation'),
        ('REQ-076', 'REQ-239', 'Monte Carlo reliability calculation'),
        ('REQ-041', 'REQ-157', 'Von Mises stress field'),
        ('REQ-042', 'REQ-231', 'Hoop stress calculation'),
        ('REQ-043', 'REQ-232', 'Axial stress calculation'),
        ('REQ-047', 'REQ-235', 'Tsai-Wu failure index'),
        ('REQ-090', 'REQ-176', 'Surrogate model confidence'),
        ('REQ-094', 'REQ-177', 'Test plan generation'),
    ]

    for id1, id2, desc in known_pairs:
        req1 = next((r for r in requirements if r['Req_ID'] == id1), None)
        req2 = next((r for r in requirements if r['Req_ID'] == id2), None)

        if req1 and req2:
            print(f"{id1} vs {id2}: {desc}")
            print(f"   {id1} ({req1['Category']}): {req1['Requirement_Description'][:80]}...")
            print(f"   {id2} ({req2['Category']}): {req2['Requirement_Description'][:80]}...")

            same_api = req1.get('API_Endpoint') == req2.get('API_Endpoint')
            same_screen = req1.get('Screen_Location') == req2.get('Screen_Location')
            same_mode = req1.get('Data_Mode') == req2.get('Data_Mode')

            if same_api and same_screen:
                print(f"   ⚠️  LIKELY DUPLICATE - Same API ({req1.get('API_Endpoint')}) and screen")
            elif req1['Category'] != req2['Category']:
                print(f"   ℹ️  Different categories - may represent different layers (UI vs backend vs data)")
            else:
                print(f"   ⚠️  REVIEW NEEDED - Same category, different implementations?")
            print()

if __name__ == "__main__":
    main()
