import { NextRequest } from 'next/server';
import { QuickOptimizationSimulator } from '@/lib/simulators/optimization-simulator';

// Required for Vercel SSE streaming support
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/optimization/[id]/stream - SSE stream for optimization progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const encoder = new TextEncoder();
  const simulator = new QuickOptimizationSimulator(id);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of simulator.stream()) {
          const data = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      } catch (error) {
        const errorEvent = `event: error\ndata: ${JSON.stringify({ error: String(error) })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
