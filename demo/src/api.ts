import type { ExportOptions, ExportReport } from 'md-exporter';

export interface RunExportResponse {
  report: ExportReport;
  downloadUrl?: string;
}

export async function runExport(options: ExportOptions): Promise<RunExportResponse> {
  const response = await fetch('/api/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export function downloadMarkdown(filename: string): void {
  const link = document.createElement('a');
  link.href = `/api/download/${filename}`;
  link.download = filename;
  link.click();
}
