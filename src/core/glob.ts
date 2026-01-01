import fg from 'fast-glob';
import type { ExportOptions } from './types';

export async function getGlobPattern(options: ExportOptions): Promise<string[]> {
  const { filter, pattern } = options;

  let globPattern: string;

  if (filter === 'glob') {
    globPattern = pattern!;
  } else if (filter === 'tsx') {
    globPattern = '**/*.tsx';
  } else if (filter === 'css') {
    globPattern = '**/*.css';
  } else if (filter === 'md') {
    globPattern = '**/*.md';
  } else if (filter === 'json') {
    globPattern = '**/*.json';
  } else {
    globPattern = '**/*';
  }

  const ignore = options.exclude?.map(dir => `**/${dir}/**`) || [];

  const files = await fg(globPattern, {
    cwd: options.targetPath,
    ignore,
    followSymbolicLinks: options.followSymlinks,
  });

  return files;
}
