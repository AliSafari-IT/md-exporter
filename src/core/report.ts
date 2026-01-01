import { promises as fs } from 'fs';
import type { ExportReport } from './types.js';

export async function writeReportJson(filePath: string, report: ExportReport): Promise<void> {
  const content = JSON.stringify(report, null, 2);
  await fs.writeFile(filePath, content, 'utf-8');
}

export function printSummary(report: ExportReport, isDryRun: boolean): void {
  console.log('\n=== Export Summary ===');
  console.log(`Total Matched: ${report.counts.totalMatched}`);
  console.log(`Included: ${report.counts.included}`);
  console.log(`Skipped (Binary): ${report.counts.skippedBinary}`);
  console.log(`Skipped (Large): ${report.counts.skippedLarge}`);
  console.log(`Skipped (Error): ${report.counts.skippedError}`);
  console.log(`Bytes Read: ${report.bytesRead}`);
  console.log(`Bytes Written: ${report.bytesWritten}`);
  console.log('\n=== Timings (ms) ===');
  console.log(`Discovery: ${report.timings.discovery}`);
  console.log(`Stat: ${report.timings.stat}`);
  console.log(`Read: ${report.timings.read}`);
  console.log(`Render: ${report.timings.render}`);
  console.log(`Prettier: ${report.timings.prettier}`);
  console.log(`Write: ${report.timings.write}`);
  console.log(`Total: ${report.timings.total}`);
  console.log('\n=== Output ===');
  if (isDryRun) {
    console.log('dry-run (no file written)');
  } else {
    console.log(`Output: ${report.outputPath}`);
  }
}
