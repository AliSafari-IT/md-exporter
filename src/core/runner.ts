import { resolve } from 'path';
import type { ExportOptions, ExportResult, ExportReport, SkippedFile } from './types';
import { getGlobPattern } from './glob';
import { checkBinary } from './binary';
import { renderFileBlock, normalizeLineEndings } from './markdown';
import { formatMarkdown } from './prettier';
import { Timer, formatTimestamp } from './time';
import { ensureDir, getFileSize, readFileContent, writeFile } from './fsutils';
import { writeReportJson, printSummary } from './report';

export async function runExport(options: ExportOptions): Promise<ExportResult> {
  const globalTimer = new Timer();
  const timers = {
    discovery: 0,
    stat: 0,
    read: 0,
    render: 0,
    prettier: 0,
    write: 0,
  };

  const defaults: Required<ExportOptions> = {
    targetPath: options.targetPath,
    filter: options.filter || 'all',
    pattern: options.pattern || '',
    exclude: options.exclude || ['node_modules', '.git', 'dist'],
    maxSize: options.maxSize || 5,
    followSymlinks: options.followSymlinks || false,
    dryRun: options.dryRun || false,
    verbose: options.verbose || false,
    outDir: options.outDir || process.cwd(),
    eol: options.eol || 'lf',
    reportJson: options.reportJson || '',
    prettier: options.prettier !== false,
  };

  const skipped: SkippedFile[] = [];
  let bytesRead = 0;
  let bytesWritten = 0;
  let markdownContent = '';

  try {
    let discoveryTimer = new Timer();
    const files = await getGlobPattern(defaults);
    timers.discovery = discoveryTimer.elapsed();

    if (defaults.verbose) {
      console.log(`Discovered ${files.length} files`);
    }

    let statTimer = new Timer();
    const fileStats: Array<{ path: string; size: number }> = [];

    for (const file of files) {
      try {
        const absolutePath = resolve(defaults.targetPath, file);
        const size = await getFileSize(absolutePath);
        fileStats.push({ path: absolutePath, size });
      } catch (error) {
        skipped.push({
          path: file,
          reason: 'error',
          details: String(error),
        });
      }
    }
    timers.stat = statTimer.elapsed();

    let readTimer = new Timer();
    const maxSizeBytes = defaults.maxSize * 1024 * 1024;

    for (const { path: absolutePath, size } of fileStats) {
      if (size > maxSizeBytes) {
        skipped.push({
          path: absolutePath,
          reason: 'large',
        });
        continue;
      }

      const isBinary = await checkBinary(absolutePath);
      if (isBinary) {
        skipped.push({
          path: absolutePath,
          reason: 'binary',
        });
        continue;
      }

      try {
        const content = await readFileContent(absolutePath);
        bytesRead += content.length;

        let renderTimer = new Timer();
        markdownContent += renderFileBlock(absolutePath, content);
        timers.render += renderTimer.elapsed();
      } catch (error) {
        skipped.push({
          path: absolutePath,
          reason: 'error',
          details: String(error),
        });
      }
    }
    timers.read = readTimer.elapsed();

    let prettierTimer = new Timer();
    if (defaults.prettier) {
      markdownContent = await formatMarkdown(markdownContent);
    }
    timers.prettier = prettierTimer.elapsed();

    markdownContent = normalizeLineEndings(markdownContent, defaults.eol);

    let outputPath: string | null = null;

    if (!defaults.dryRun) {
      let writeTimer = new Timer();
      await ensureDir(defaults.outDir);

      const timestamp = formatTimestamp();
      const filterName = defaults.filter === 'glob' ? 'glob' : defaults.filter;
      const filename = `${timestamp}_${filterName}.md`;
      outputPath = resolve(defaults.outDir, filename);

      await writeFile(outputPath, markdownContent);
      bytesWritten = markdownContent.length;
      timers.write = writeTimer.elapsed();

      if (defaults.reportJson && outputPath) {
        await writeReportJson(defaults.reportJson, {
          args: defaults,
          counts: {
            totalMatched: files.length,
            included: fileStats.length - skipped.length,
            skippedBinary: skipped.filter(s => s.reason === 'binary').length,
            skippedLarge: skipped.filter(s => s.reason === 'large').length,
            skippedError: skipped.filter(s => s.reason === 'error').length,
          },
          skipped,
          bytesRead,
          bytesWritten,
          timings: {
            ...timers,
            total: globalTimer.elapsed(),
          },
          outputPath,
        });
      }
    }

    const report: ExportReport = {
      args: defaults,
      counts: {
        totalMatched: files.length,
        included: fileStats.length - skipped.filter(s => s.reason !== 'error').length,
        skippedBinary: skipped.filter(s => s.reason === 'binary').length,
        skippedLarge: skipped.filter(s => s.reason === 'large').length,
        skippedError: skipped.filter(s => s.reason === 'error').length,
      },
      skipped,
      bytesRead,
      bytesWritten,
      timings: {
        ...timers,
        total: globalTimer.elapsed(),
      },
      outputPath,
    };

    printSummary(report, defaults.dryRun);

    return {
      outputMarkdownPath: outputPath,
      report,
      markdownText: markdownContent,
    };
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}
