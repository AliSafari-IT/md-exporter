import { Command } from 'commander';
import type { ExportOptions } from './types';

export function parseArgs(): ExportOptions {
  const program = new Command();

  program
    .name('md-exporter')
    .description('Export files from a target folder into a single Markdown file')
    .version('0.1.0')
    .argument('<targetPath>', 'Target directory path')
    .option('--filter <type>', 'Filter type: all|tsx|css|md|glob', 'all')
    .option('--pattern <glob>', 'Glob pattern (required for filter=glob)')
    .option('--exclude <csv>', 'Comma-separated directory exclusions', 'node_modules,.git,dist')
    .option('--max-size <mb>', 'Maximum file size in MB', '5')
    .option('--follow-symlinks', 'Follow symbolic links', false)
    .option('--dry-run', 'Perform a dry run', false)
    .option('--verbose', 'Enable verbose logging', false)
    .option('--out-dir <path>', 'Output directory', process.cwd())
    .option('--eol <type>', 'End-of-line style: lf|crlf', 'lf')
    .option('--report-json <path>', 'Write JSON report to path')
    .option('--no-prettier', 'Skip Prettier formatting');

  program.parse(process.argv);

  const args = program.args;
  const opts = program.opts();

  if (args.length === 0) {
    program.help();
    process.exit(1);
  }

  const targetPath = args[0];
  const filter = opts.filter as string;

  if (filter === 'glob' && !opts.pattern) {
    console.error('Error: --pattern is required when --filter=glob');
    process.exit(1);
  }

  return {
    targetPath,
    filter: filter as any,
    pattern: opts.pattern,
    exclude: opts.exclude.split(',').map((s: string) => s.trim()),
    maxSize: parseInt(opts.maxSize, 10),
    followSymlinks: opts.followSymlinks,
    dryRun: opts.dryRun,
    verbose: opts.verbose,
    outDir: opts.outDir,
    eol: opts.eol as any,
    reportJson: opts.reportJson,
    prettier: opts.prettier !== false,
  };
}
