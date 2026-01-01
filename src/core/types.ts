export type FilterType = 'all' | 'tsx' | 'css' | 'md' | 'json' | 'glob';
export type EolType = 'lf' | 'crlf';

export interface ExportOptions {
  targetPath: string;
  filter?: FilterType;
  pattern?: string;
  exclude?: string[];
  maxSize?: number;
  followSymlinks?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  outDir?: string;
  eol?: EolType;
  reportJson?: string;
  prettier?: boolean;
}

export interface FileEntry {
  path: string;
  absolutePath: string;
  size: number;
  content?: string;
}

export interface SkippedFile {
  path: string;
  reason: 'binary' | 'large' | 'error';
  details?: string;
}

export interface TimingBreakdown {
  discovery: number;
  stat: number;
  read: number;
  render: number;
  prettier: number;
  write: number;
  total: number;
}

export interface ExportReport {
  args: ExportOptions;
  counts: {
    totalMatched: number;
    included: number;
    skippedBinary: number;
    skippedLarge: number;
    skippedError: number;
  };
  skipped: SkippedFile[];
  bytesRead: number;
  bytesWritten: number;
  timings: TimingBreakdown;
  outputPath: string | null;
}

export interface ExportResult {
  outputMarkdownPath: string | null;
  report: ExportReport;
  markdownText?: string;
}
