export function getLanguageTag(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';

  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    css: 'css',
    scss: 'scss',
    md: 'markdown',
    html: 'html',
    yaml: 'yaml',
    yml: 'yaml',
    cs: 'csharp',
    java: 'java',
    py: 'python',
    sh: 'bash',
    bash: 'bash',
    ps1: 'powershell',
    xml: 'xml',
    sql: 'sql',
  };

  return langMap[ext] || '';
}
