import { getLanguageTag } from './lang';

export function renderFileBlock(absolutePath: string, content: string): string {
  const lang = getLanguageTag(absolutePath);
  const fence = '```';
  const langTag = lang ? lang : '';

  return `file ${absolutePath}:\n${fence}${langTag}\n${content}\n${fence}\n`;
}

export function normalizeLineEndings(text: string, eol: 'lf' | 'crlf'): string {
  const normalized = text.replace(/\r\n|\r|\n/g, '\n');
  return eol === 'crlf' ? normalized.replace(/\n/g, '\r\n') : normalized;
}
