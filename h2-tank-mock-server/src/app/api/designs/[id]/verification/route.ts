import { NextRequest, NextResponse } from 'next/server';

// GET /api/designs/[id]/verification - Get verification checklist and approval status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designId = id.toUpperCase();

    const validDesigns = ['A', 'B', 'C', 'D', 'E'];
    if (!validDesigns.includes(designId)) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const checklist = [
      {
        id: 'V1',
        category: 'Design Requirements',
        item: 'Operating pressure verified (700 bar)',
        status: 'approved',
        reviewer: 'J. Smith',
        date: '2024-11-15',
        notes: 'Meets ISO 11119-3 requirements'
      },
      {
        id: 'V2',
        category: 'Design Requirements',
        item: 'Burst pressure ratio ≥ 2.25',
        status: 'approved',
        reviewer: 'J. Smith',
        date: '2024-11-15',
        notes: 'Ratio = 2.27, passes'
      },
      {
        id: 'V3',
        category: 'Materials',
        item: 'Material properties validated',
        status: 'approved',
        reviewer: 'A. Johnson',
        date: '2024-11-16',
        notes: 'Test certificates reviewed and approved'
      },
      {
        id: 'V4',
        category: 'Materials',
        item: 'Liner compatibility with hydrogen',
        status: 'approved',
        reviewer: 'A. Johnson',
        date: '2024-11-16',
        notes: 'HDPE liner approved for H2 service'
      },
      {
        id: 'V5',
        category: 'Analysis',
        item: 'FEA model validation',
        status: 'approved',
        reviewer: 'M. Chen',
        date: '2024-11-18',
        notes: 'Mesh convergence study completed'
      },
      {
        id: 'V6',
        category: 'Analysis',
        item: 'Stress analysis review',
        status: 'approved',
        reviewer: 'M. Chen',
        date: '2024-11-18',
        notes: 'Maximum stress within allowables'
      },
      {
        id: 'V7',
        category: 'Analysis',
        item: 'Thermal analysis review',
        status: 'approved',
        reviewer: 'M. Chen',
        date: '2024-11-19',
        notes: 'Fast-fill thermal loads acceptable'
      },
      {
        id: 'V8',
        category: 'Manufacturing',
        item: 'Winding pattern feasibility',
        status: 'approved',
        reviewer: 'R. Patel',
        date: '2024-11-20',
        notes: 'Pattern verified with manufacturing team'
      },
      {
        id: 'V9',
        category: 'Manufacturing',
        item: 'Cure cycle validation',
        status: 'approved',
        reviewer: 'R. Patel',
        date: '2024-11-20',
        notes: 'Cure cycle optimized for resin system'
      },
      {
        id: 'V10',
        category: 'Standards Compliance',
        item: 'ISO 11119-3 compliance verified',
        status: 'approved',
        reviewer: 'K. Williams',
        date: '2024-11-22',
        notes: 'All requirements satisfied'
      },
      {
        id: 'V11',
        category: 'Standards Compliance',
        item: 'UN R134 compliance verified',
        status: 'approved',
        reviewer: 'K. Williams',
        date: '2024-11-22',
        notes: 'EU market requirements met'
      },
      {
        id: 'V12',
        category: 'Safety',
        item: 'FMEA completed',
        status: 'approved',
        reviewer: 'L. Brown',
        date: '2024-11-25',
        notes: 'No critical failure modes identified'
      },
      {
        id: 'V13',
        category: 'Safety',
        item: 'Hazard analysis review',
        status: 'pending',
        reviewer: 'L. Brown',
        date: null,
        notes: 'Final review scheduled for 2024-12-01'
      }
    ];

    const approvalStatus = {
      total_items: checklist.length,
      approved: checklist.filter(item => item.status === 'approved').length,
      pending: checklist.filter(item => item.status === 'pending').length,
      rejected: checklist.filter(item => item.status === 'rejected').length,
      overall_status: checklist.every(item => item.status === 'approved') ? 'approved' : 'in_review',
      ready_for_manufacture: checklist.filter(item => item.status === 'approved').length >= 12
    };

    const response = {
      design_id: designId,
      checklist,
      approval_status: approvalStatus,
      reviewers: [
        { name: 'J. Smith', role: 'Lead Design Engineer', department: 'Engineering' },
        { name: 'A. Johnson', role: 'Materials Specialist', department: 'Materials' },
        { name: 'M. Chen', role: 'Senior Analyst', department: 'Analysis' },
        { name: 'R. Patel', role: 'Manufacturing Engineer', department: 'Production' },
        { name: 'K. Williams', role: 'Compliance Officer', department: 'Quality' },
        { name: 'L. Brown', role: 'Safety Engineer', department: 'Safety' }
      ],
      next_steps: approvalStatus.overall_status === 'approved'
        ? ['Proceed to manufacturing', 'Schedule validation testing']
        : ['Complete pending reviews', 'Address any findings']
    };

    return NextResponse.json(response, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
