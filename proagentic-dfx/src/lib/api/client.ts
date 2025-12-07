// H2 Tank Designer API Client

import type { ParsedRequirements } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Standards
export async function getStandards() {
  return fetchJson('/standards');
}

// Materials
export async function getMaterials() {
  return fetchJson('/materials');
}

// Requirements
export async function parseRequirements(text: string) {
  return fetchJson('/requirements/parse', {
    method: 'POST',
    body: JSON.stringify({ raw_text: text }),
  });
}

// Chat-based requirements gathering (REQ-190 to REQ-196)
export async function sendChatMessage(message: string, conversationHistory: Array<{ role: string; content: string }>) {
  return fetchJson('/requirements/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
    }),
  });
}

// Tank Type
export async function recommendTankType(requirements: ParsedRequirements) {
  return fetchJson('/tank-type/recommend', {
    method: 'POST',
    body: JSON.stringify({ requirements }),
  });
}

// Optimization
export async function startOptimization(config: Record<string, unknown>) {
  return fetchJson('/optimization', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function getOptimizationStatus(jobId: string) {
  return fetchJson(`/optimization/${jobId}`);
}

export async function cancelOptimization(jobId: string) {
  return fetchJson(`/optimization/${jobId}`, {
    method: 'DELETE',
  });
}

export async function getOptimizationResults(jobId: string) {
  return fetchJson(`/optimization/${jobId}/results`);
}

export function createOptimizationStream(jobId: string): EventSource {
  return new EventSource(`${API_BASE}/optimization/${jobId}/stream`);
}

// Designs
export async function getDesign(designId: string) {
  return fetchJson(`/designs/${designId}`);
}

export async function getDesignGeometry(designId: string) {
  return fetchJson(`/designs/${designId}/geometry`);
}

export async function getDesignStress(designId: string) {
  return fetchJson(`/designs/${designId}/stress`);
}

export async function getDesignFailure(designId: string) {
  return fetchJson(`/designs/${designId}/failure`);
}

export async function getDesignThermal(designId: string) {
  return fetchJson(`/designs/${designId}/thermal`);
}

export async function getDesignReliability(designId: string) {
  return fetchJson(`/designs/${designId}/reliability`);
}

export async function getDesignCost(designId: string) {
  return fetchJson(`/designs/${designId}/cost`);
}

export async function getDesignCompliance(designId: string) {
  return fetchJson(`/designs/${designId}/compliance`);
}

export async function getDesignTestPlan(designId: string) {
  return fetchJson(`/designs/${designId}/test-plan`);
}

export async function getDesignSentry(designId: string) {
  return fetchJson(`/designs/${designId}/sentry`);
}

// Compare
export async function compareDesigns(designIds: string[]) {
  return fetchJson('/compare', {
    method: 'POST',
    body: JSON.stringify({ design_ids: designIds }),
  });
}

// Export
export async function startExport(config: {
  design_id: string;
  include: Record<string, string[]>;
  format: 'zip';
}) {
  return fetchJson('/export', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function getExportStatus(exportId: string) {
  return fetchJson(`/export/${exportId}`);
}

export function getExportDownloadUrl(exportId: string): string {
  return `${API_BASE}/export/${exportId}/download`;
}
