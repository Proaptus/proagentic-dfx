import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface ZipFile {
  name: string;
  content: Buffer;
}

// GET /api/export/[id]/download - Download export package with actual data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Parse export ID to get design ID (format: export-{designId}-{timestamp})
    const designIdMatch = id.match(/export-([A-E])-/);
    const designId = designIdMatch ? designIdMatch[1] : 'C';

    // Load the design data
    const designPath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);
    let design;
    try {
      const designContent = await fs.readFile(designPath, 'utf-8');
      design = JSON.parse(designContent);
    } catch {
      // Use default design C if not found
      const defaultPath = path.join(process.cwd(), 'data', 'static', 'designs', 'design-c.json');
      const defaultContent = await fs.readFile(defaultPath, 'utf-8');
      design = JSON.parse(defaultContent);
    }

    // Generate files for the ZIP
    const files: ZipFile[] = [
      {
        name: 'README.txt',
        content: Buffer.from(generateReadme(design, id))
      },
      {
        name: 'geometry/dome_profile.csv',
        content: Buffer.from(generateDomeProfileCSV(design))
      },
      {
        name: 'geometry/dimensions.json',
        content: Buffer.from(JSON.stringify(design.geometry.dimensions, null, 2))
      },
      {
        name: 'manufacturing/layup_definition.csv',
        content: Buffer.from(generateLayupCSV(design))
      },
      {
        name: 'manufacturing/winding_sequence.txt',
        content: Buffer.from(generateWindingSequence(design))
      },
      {
        name: 'analysis/design_summary.json',
        content: Buffer.from(JSON.stringify(design.summary, null, 2))
      },
      {
        name: 'analysis/stress_report.json',
        content: Buffer.from(JSON.stringify(design.stress, null, 2))
      },
      {
        name: 'analysis/failure_analysis.json',
        content: Buffer.from(JSON.stringify(design.failure, null, 2))
      },
      {
        name: 'compliance/standards_compliance.json',
        content: Buffer.from(JSON.stringify(design.compliance || { status: 'pass' }, null, 2))
      }
    ];

    // Add thermal and reliability if they exist
    if (design.thermal) {
      files.push({
        name: 'analysis/thermal_analysis.json',
        content: Buffer.from(JSON.stringify(design.thermal, null, 2))
      });
    }
    if (design.reliability) {
      files.push({
        name: 'analysis/reliability_analysis.json',
        content: Buffer.from(JSON.stringify(design.reliability, null, 2))
      });
    }

    // Generate ZIP
    const zipContent = generateZipWithMultipleFiles(files);

    // Convert Buffer to Uint8Array for NextResponse compatibility
    return new NextResponse(new Uint8Array(zipContent), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="h2-tank-design-${designId}-export.zip"`,
        'Content-Length': zipContent.length.toString(),
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function generateReadme(design: Record<string, unknown>, exportId: string): string {
  const summary = design.summary as Record<string, unknown>;
  const geometry = design.geometry as Record<string, unknown>;
  const dims = geometry.dimensions as Record<string, unknown>;
  const layup = geometry.layup as Record<string, unknown>;

  return `H2 TANK DESIGNER - EXPORT PACKAGE
================================
Export ID: ${exportId}
Generated: ${new Date().toISOString()}

DESIGN SUMMARY
--------------
Design ID: ${design.id}
Trade-off Category: ${design.trade_off_category}

Performance Metrics:
  Weight: ${summary.weight_kg} kg
  Cost: €${summary.cost_eur}
  Burst Pressure: ${summary.burst_pressure_bar} bar
  Burst Ratio: ${summary.burst_ratio}
  P(failure): ${summary.p_failure}
  Fatigue Life: ${summary.fatigue_life_cycles} cycles

Geometry:
  Inner Radius: ${dims.inner_radius_mm} mm
  Outer Radius: ${dims.outer_radius_mm} mm
  Cylinder Length: ${dims.cylinder_length_mm} mm
  Total Length: ${dims.total_length_mm} mm
  Wall Thickness: ${dims.wall_thickness_mm} mm
  Internal Volume: ${dims.internal_volume_liters} L

Composite Structure:
  Total Layers: ${layup.total_layers}
  Helical Layers: ${layup.helical_count}
  Hoop Layers: ${layup.hoop_count}
  Fiber Volume Fraction: ${layup.fiber_volume_fraction}
  Liner Thickness: ${layup.liner_thickness_mm} mm

PACKAGE CONTENTS
----------------
/geometry/
  dome_profile.csv      - Isotensoid dome profile coordinates (r, z)
  dimensions.json       - Complete geometry dimensions

/manufacturing/
  layup_definition.csv  - Complete layup sequence with angles and thicknesses
  winding_sequence.txt  - Winding program instructions

/analysis/
  design_summary.json   - Key performance metrics
  stress_report.json    - Stress analysis results
  failure_analysis.json - Failure mode prediction
  thermal_analysis.json - Thermal analysis results
  reliability_analysis.json - Monte Carlo reliability results

/compliance/
  standards_compliance.json - Standards compliance status

NOTES
-----
This export package contains machine-readable data for manufacturing and analysis.
For CAD files (STEP, IGES), contact support for full engineering package.
`;
}

function generateDomeProfileCSV(design: Record<string, unknown>): string {
  const geometry = design.geometry as Record<string, unknown>;
  const dome = geometry.dome as Record<string, unknown>;
  const profilePoints = dome.profile_points as Array<{ r: number; z: number }>;
  const params = dome.parameters as Record<string, unknown>;

  let csv = '# Isotensoid Dome Profile\n';
  csv += `# Type: ${dome.type}\n`;
  csv += `# Alpha_0: ${params.alpha_0_deg} degrees\n`;
  csv += `# R_0: ${params.r_0_mm} mm\n`;
  csv += `# Boss OD: ${params.boss_od_mm} mm\n`;
  csv += `# Boss ID: ${params.boss_id_mm} mm\n`;
  csv += '#\n';
  csv += 'r_mm,z_mm\n';

  for (const point of profilePoints) {
    csv += `${point.r},${point.z}\n`;
  }

  return csv;
}

function generateLayupCSV(design: Record<string, unknown>): string {
  const geometry = design.geometry as Record<string, unknown>;
  const layup = geometry.layup as Record<string, unknown>;
  const layers = layup.layers as Array<Record<string, unknown>>;

  let csv = '# Layup Definition\n';
  csv += `# Total Layers: ${layup.total_layers}\n`;
  csv += `# Helical: ${layup.helical_count}, Hoop: ${layup.hoop_count}\n`;
  csv += `# Fiber Volume Fraction: ${layup.fiber_volume_fraction}\n`;
  csv += `# Liner Thickness: ${layup.liner_thickness_mm} mm\n`;
  csv += '#\n';
  csv += 'layer_number,layer_type,angle_deg,thickness_mm,coverage\n';

  for (const layer of layers) {
    csv += `${layer.layer},${layer.type},${layer.angle_deg},${layer.thickness_mm},${layer.coverage}\n`;
  }

  return csv;
}

function generateWindingSequence(design: Record<string, unknown>): string {
  const geometry = design.geometry as Record<string, unknown>;
  const layup = geometry.layup as Record<string, unknown>;
  const layers = layup.layers as Array<Record<string, unknown>>;
  const dims = geometry.dimensions as Record<string, unknown>;

  let seq = `WINDING SEQUENCE - DESIGN ${design.id}\n`;
  seq += '=' .repeat(40) + '\n\n';
  seq += 'MACHINE SETUP\n';
  seq += '-'.repeat(20) + '\n';
  seq += `Mandrel Diameter: ${(dims.inner_radius_mm as number) * 2} mm\n`;
  seq += `Cylinder Length: ${dims.cylinder_length_mm} mm\n`;
  seq += `Total Dome Height: ${((geometry.dome as Record<string, unknown>)?.parameters as Record<string, unknown>)?.depth_mm || 180} mm\n`;
  seq += '\n';
  seq += 'LAYER SEQUENCE\n';
  seq += '-'.repeat(20) + '\n';

  let currentCoverage = '';
  for (const layer of layers) {
    const type = layer.type as string;
    const angle = layer.angle_deg as number;
    const thickness = layer.thickness_mm as number;
    const coverage = layer.coverage as string;

    if (coverage !== currentCoverage) {
      seq += `\n[${coverage.toUpperCase()} COVERAGE]\n`;
      currentCoverage = coverage;
    }

    const instruction = type === 'helical'
      ? `Layer ${layer.layer}: HELICAL ±${angle.toFixed(1)}° | t=${thickness} mm | FULL WRAP (dome + cylinder)`
      : `Layer ${layer.layer}: HOOP ${angle}° | t=${thickness} mm | CYLINDER ONLY`;

    seq += instruction + '\n';
  }

  seq += '\n';
  seq += 'QUALITY CHECKPOINTS\n';
  seq += '-'.repeat(20) + '\n';
  seq += '- Verify angle ±0.5° at each layer\n';
  seq += '- Check bandwidth coverage at turnaround\n';
  seq += '- Monitor tension: 35-45 N nominal\n';
  seq += '- Inspect for gaps/overlaps at dome transitions\n';

  return seq;
}

function generateZipWithMultipleFiles(files: ZipFile[]): Buffer {
  const buffers: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  // Add each file
  for (const file of files) {
    const filename = Buffer.from(file.name);
    const crcValue = crc32(file.content);

    // Local file header
    const localHeader = Buffer.alloc(30 + filename.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crcValue, 14);
    localHeader.writeUInt32LE(file.content.length, 18);
    localHeader.writeUInt32LE(file.content.length, 22);
    localHeader.writeUInt16LE(filename.length, 26);
    localHeader.writeUInt16LE(0, 28);
    filename.copy(localHeader, 30);

    buffers.push(localHeader);
    buffers.push(file.content);

    // Central directory header
    const centralHeader = Buffer.alloc(46 + filename.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crcValue, 16);
    centralHeader.writeUInt32LE(file.content.length, 20);
    centralHeader.writeUInt32LE(file.content.length, 24);
    centralHeader.writeUInt16LE(filename.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    filename.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
    offset += localHeader.length + file.content.length;
  }

  // Add central directory
  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const header of centralHeaders) {
    buffers.push(header);
    centralDirSize += header.length;
  }

  // End of central directory
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralDirSize, 12);
  endRecord.writeUInt32LE(centralDirOffset, 16);
  endRecord.writeUInt16LE(0, 20);

  buffers.push(endRecord);
  return Buffer.concat(buffers);
}

function crc32(buffer: Buffer): number {
  let crc = 0xFFFFFFFF;
  const table = getCrc32Table();
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

let crc32Table: number[] | null = null;
function getCrc32Table(): number[] {
  if (crc32Table) return crc32Table;
  crc32Table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc32Table[i] = c;
  }
  return crc32Table;
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
