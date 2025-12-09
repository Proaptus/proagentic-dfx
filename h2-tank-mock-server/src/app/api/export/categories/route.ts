import { NextResponse } from 'next/server';

// GET /api/export/categories - Get export format categories and options
export async function GET() {
  try {
    const categories = [
      {
        id: 'cad',
        name: 'CAD Models',
        description: 'Export 3D geometry for CAD/CAM systems',
        formats: [
          {
            id: 'step',
            name: 'STEP (ISO 10303)',
            extension: '.step',
            description: 'Industry standard for CAD data exchange',
            features: ['Geometry', 'Assembly structure', 'Material assignments'],
            file_size_estimate_mb: 2.5,
            compatibility: ['SolidWorks', 'CATIA', 'NX', 'Creo', 'Inventor']
          },
          {
            id: 'iges',
            name: 'IGES',
            extension: '.iges',
            description: 'Legacy CAD exchange format',
            features: ['Geometry', 'Basic metadata'],
            file_size_estimate_mb: 1.8,
            compatibility: ['Most CAD systems', 'Legacy software']
          },
          {
            id: 'parasolid',
            name: 'Parasolid',
            extension: '.x_t',
            description: 'High-fidelity CAD kernel format',
            features: ['Geometry', 'Features', 'Assemblies'],
            file_size_estimate_mb: 3.2,
            compatibility: ['NX', 'SolidEdge', 'SolidWorks', 'Onshape']
          }
        ]
      },
      {
        id: 'analysis',
        name: 'Analysis Models',
        description: 'Export for FEA and simulation software',
        formats: [
          {
            id: 'abaqus_inp',
            name: 'Abaqus Input File',
            extension: '.inp',
            description: 'Complete FE model with mesh, materials, loads, and BCs',
            features: ['Mesh', 'Materials', 'Layup', 'Loads', 'Boundary conditions', 'Step definitions'],
            file_size_estimate_mb: 15.7,
            compatibility: ['Abaqus', 'Abaqus CAE']
          },
          {
            id: 'ansys_db',
            name: 'ANSYS Database',
            extension: '.db',
            description: 'ANSYS Mechanical database format',
            features: ['Mesh', 'Materials', 'Contact', 'Loads'],
            file_size_estimate_mb: 12.3,
            compatibility: ['ANSYS Mechanical', 'ANSYS Workbench']
          },
          {
            id: 'nastran_bdf',
            name: 'Nastran Bulk Data',
            extension: '.bdf',
            description: 'MSC/NX Nastran input format',
            features: ['Mesh', 'Materials', 'Composite properties', 'Load cases'],
            file_size_estimate_mb: 8.9,
            compatibility: ['MSC Nastran', 'NX Nastran', 'Optistruct']
          }
        ]
      },
      {
        id: 'manufacturing',
        name: 'Manufacturing Data',
        description: 'Export for production and fabrication',
        formats: [
          {
            id: 'fiber_path',
            name: 'Fiber Path Definition',
            extension: '.xml',
            description: 'CNC winding machine program with fiber paths and angles',
            features: ['Layer sequence', 'Winding angles', 'Fiber tension', 'Machine parameters'],
            file_size_estimate_mb: 0.3,
            compatibility: ['MIKROSAM', 'MF Tech', 'Roth Composite', 'Custom winders']
          },
          {
            id: 'cure_recipe',
            name: 'Cure Cycle Recipe',
            extension: '.csv',
            description: 'Autoclave or oven cure cycle definition',
            features: ['Temperature profile', 'Pressure profile', 'Vacuum steps', 'Timing'],
            file_size_estimate_mb: 0.05,
            compatibility: ['ASC Process Systems', 'Scholz', 'Thermal Equipment', 'Custom systems']
          },
          {
            id: 'quality_plan',
            name: 'Quality Control Plan',
            extension: '.pdf',
            description: 'Inspection and testing requirements',
            features: ['Inspection points', 'NDT requirements', 'Acceptance criteria', 'Documentation'],
            file_size_estimate_mb: 1.2,
            compatibility: ['Universal PDF readers']
          }
        ]
      },
      {
        id: 'documentation',
        name: 'Documentation',
        description: 'Export design reports and documentation',
        formats: [
          {
            id: 'design_report_pdf',
            name: 'Design Report (PDF)',
            extension: '.pdf',
            description: 'Comprehensive design documentation with analysis results',
            features: ['Geometry specs', 'Material data', 'Analysis results', 'Compliance matrix', 'Charts'],
            file_size_estimate_mb: 8.5,
            compatibility: ['Universal PDF readers']
          },
          {
            id: 'design_report_docx',
            name: 'Design Report (Word)',
            extension: '.docx',
            description: 'Editable design documentation',
            features: ['Geometry specs', 'Material data', 'Analysis results', 'Compliance matrix'],
            file_size_estimate_mb: 4.2,
            compatibility: ['Microsoft Word', 'LibreOffice', 'Google Docs']
          },
          {
            id: 'technical_drawing',
            name: 'Technical Drawings',
            extension: '.pdf',
            description: 'Engineering drawings with dimensions and tolerances',
            features: ['2D drawings', 'Dimensions', 'Tolerances', 'Notes', 'Title block'],
            file_size_estimate_mb: 2.1,
            compatibility: ['Universal PDF readers']
          }
        ]
      },
      {
        id: 'data',
        name: 'Raw Data',
        description: 'Export design data in structured formats',
        formats: [
          {
            id: 'json',
            name: 'JSON Data',
            extension: '.json',
            description: 'Complete design data in JSON format',
            features: ['All design parameters', 'Analysis results', 'Material properties', 'Metadata'],
            file_size_estimate_mb: 0.8,
            compatibility: ['Any programming language', 'API integration']
          },
          {
            id: 'excel',
            name: 'Excel Workbook',
            extension: '.xlsx',
            description: 'Design data in spreadsheet format with multiple sheets',
            features: ['Geometry data', 'Material properties', 'Layup schedule', 'Results summary'],
            file_size_estimate_mb: 1.5,
            compatibility: ['Microsoft Excel', 'LibreOffice Calc', 'Google Sheets']
          },
          {
            id: 'csv',
            name: 'CSV Files (Archive)',
            extension: '.zip',
            description: 'Multiple CSV files in a ZIP archive',
            features: ['Separate files for each data type', 'Easy to parse', 'Lightweight'],
            file_size_estimate_mb: 0.4,
            compatibility: ['Any spreadsheet or database tool']
          }
        ]
      },
      {
        id: 'visualization',
        name: 'Visualization',
        description: 'Export for 3D viewing and presentation',
        formats: [
          {
            id: 'obj',
            name: 'OBJ + MTL',
            extension: '.obj',
            description: 'Mesh geometry with materials',
            features: ['3D mesh', 'Material colors', 'UV mapping'],
            file_size_estimate_mb: 5.2,
            compatibility: ['Blender', 'Maya', '3DS Max', 'Web viewers']
          },
          {
            id: 'gltf',
            name: 'glTF 2.0',
            extension: '.gltf',
            description: 'Modern 3D format optimized for web and AR/VR',
            features: ['3D mesh', 'PBR materials', 'Animations', 'Compact'],
            file_size_estimate_mb: 3.8,
            compatibility: ['Three.js', 'Babylon.js', 'AR apps', 'Modern 3D viewers']
          },
          {
            id: 'stl',
            name: 'STL',
            extension: '.stl',
            description: 'Simple mesh format for 3D printing and viewing',
            features: ['Triangle mesh only'],
            file_size_estimate_mb: 4.5,
            compatibility: ['3D printing software', 'Most 3D viewers']
          }
        ]
      }
    ];

    return NextResponse.json({
      categories,
      total_categories: categories.length,
      total_formats: categories.reduce((sum, cat) => sum + cat.formats.length, 0)
    }, {
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
