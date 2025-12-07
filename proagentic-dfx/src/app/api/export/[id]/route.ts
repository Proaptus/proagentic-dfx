import { NextRequest, NextResponse } from 'next/server';

// In-memory export job store (would be Redis/DB in production)
const exportJobs = new Map<string, {
  status: 'generating' | 'ready' | 'failed';
  progress: number;
  startTime: number;
  downloadUrl?: string;
}>();

// GET /api/export/[id] - Get export status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Simulate progress based on time elapsed
    let job = exportJobs.get(id);

    if (!job) {
      // Create a simulated job that starts "generating"
      const startTime = Date.now() - Math.random() * 20000; // Random 0-20 seconds ago
      job = {
        status: 'generating',
        progress: 0,
        startTime
      };
      exportJobs.set(id, job);
    }

    // Calculate progress based on elapsed time (30 second total)
    const elapsed = Date.now() - job.startTime;
    const progress = Math.min(100, Math.floor((elapsed / 30000) * 100));

    if (progress >= 100 && job.status === 'generating') {
      job.status = 'ready';
      job.progress = 100;
      job.downloadUrl = `/api/export/${id}/download`;
    } else {
      job.progress = progress;
    }

    const response: Record<string, unknown> = {
      export_id: id,
      status: job.status,
      progress_percent: job.progress
    };

    if (job.status === 'ready') {
      response.download_url = job.downloadUrl;
      response.expires_at = new Date(Date.now() + 3600000).toISOString(); // 1 hour
      response.file_size_mb = 2.4;
    } else {
      response.estimated_remaining_seconds = Math.ceil((30000 - (Date.now() - job.startTime)) / 1000);
    }

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
