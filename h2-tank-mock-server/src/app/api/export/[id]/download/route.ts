import { NextRequest, NextResponse } from 'next/server';

// GET /api/export/[id]/download - Download export package
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Generate a mock ZIP file content (small placeholder)
    const mockZipContent = generateMockZipContent(id);

    return new NextResponse(mockZipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="h2-tank-export-${id}.zip"`,
        'Content-Length': mockZipContent.length.toString(),
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function generateMockZipContent(exportId: string): Buffer {
  // Generate a valid ZIP file with minimal content
  // ZIP file structure: Local file header + file data + central directory + end record

  const filename = 'README.txt';
  const fileContent = Buffer.from(
    `H2 Tank Designer Export Package\n` +
    `Export ID: ${exportId}\n` +
    `Generated: ${new Date().toISOString()}\n\n` +
    `This is a mock export package for demonstration purposes.\n` +
    `In production, this would contain:\n` +
    `- geometry/ - CAD files (STEP, STL)\n` +
    `- manufacturing/ - Winding programs, QC specs\n` +
    `- analysis/ - FEA results, stress reports\n` +
    `- compliance/ - Standards compliance documents\n` +
    `- sentry/ - Monitoring specifications\n`
  );

  // Build ZIP file manually
  const buffers: Buffer[] = [];

  // Local file header
  const localHeader = Buffer.alloc(30 + filename.length);
  localHeader.writeUInt32LE(0x04034b50, 0); // Local file header signature
  localHeader.writeUInt16LE(20, 4); // Version needed
  localHeader.writeUInt16LE(0, 6); // General purpose flag
  localHeader.writeUInt16LE(0, 8); // Compression method (store)
  localHeader.writeUInt16LE(0, 10); // Last mod time
  localHeader.writeUInt16LE(0, 12); // Last mod date
  localHeader.writeUInt32LE(crc32(fileContent), 14); // CRC-32
  localHeader.writeUInt32LE(fileContent.length, 18); // Compressed size
  localHeader.writeUInt32LE(fileContent.length, 22); // Uncompressed size
  localHeader.writeUInt16LE(filename.length, 26); // Filename length
  localHeader.writeUInt16LE(0, 28); // Extra field length
  Buffer.from(filename).copy(localHeader, 30);

  buffers.push(localHeader);
  buffers.push(fileContent);

  const localOffset = 0;
  const centralOffset = localHeader.length + fileContent.length;

  // Central directory header
  const centralHeader = Buffer.alloc(46 + filename.length);
  centralHeader.writeUInt32LE(0x02014b50, 0); // Central directory signature
  centralHeader.writeUInt16LE(20, 4); // Version made by
  centralHeader.writeUInt16LE(20, 6); // Version needed
  centralHeader.writeUInt16LE(0, 8); // General purpose flag
  centralHeader.writeUInt16LE(0, 10); // Compression method
  centralHeader.writeUInt16LE(0, 12); // Last mod time
  centralHeader.writeUInt16LE(0, 14); // Last mod date
  centralHeader.writeUInt32LE(crc32(fileContent), 16); // CRC-32
  centralHeader.writeUInt32LE(fileContent.length, 20); // Compressed size
  centralHeader.writeUInt32LE(fileContent.length, 24); // Uncompressed size
  centralHeader.writeUInt16LE(filename.length, 28); // Filename length
  centralHeader.writeUInt16LE(0, 30); // Extra field length
  centralHeader.writeUInt16LE(0, 32); // File comment length
  centralHeader.writeUInt16LE(0, 34); // Disk number start
  centralHeader.writeUInt16LE(0, 36); // Internal file attributes
  centralHeader.writeUInt32LE(0, 38); // External file attributes
  centralHeader.writeUInt32LE(localOffset, 42); // Relative offset of local header
  Buffer.from(filename).copy(centralHeader, 46);

  buffers.push(centralHeader);

  // End of central directory record
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0); // End of central directory signature
  endRecord.writeUInt16LE(0, 4); // Disk number
  endRecord.writeUInt16LE(0, 6); // Disk number with central directory
  endRecord.writeUInt16LE(1, 8); // Number of entries on this disk
  endRecord.writeUInt16LE(1, 10); // Total number of entries
  endRecord.writeUInt32LE(centralHeader.length, 12); // Size of central directory
  endRecord.writeUInt32LE(centralOffset, 16); // Offset of central directory
  endRecord.writeUInt16LE(0, 20); // Comment length

  buffers.push(endRecord);

  return Buffer.concat(buffers);
}

// Simple CRC-32 implementation
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
