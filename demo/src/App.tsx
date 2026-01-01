import { useState } from 'react';
import type { ExportOptions, ExportReport } from 'md-exporter';
import { runExport, downloadMarkdown } from './api';
import './styles.css';

export default function App() {
  const [targetPath, setTargetPath] = useState('');
  const [filter, setFilter] = useState<'all' | 'tsx' | 'css' | 'md' | 'glob'>('all');
  const [pattern, setPattern] = useState('');
  const [exclude, setExclude] = useState('node_modules,.git,dist');
  const [maxSize, setMaxSize] = useState(5);
  const [followSymlinks, setFollowSymlinks] = useState(false);
  const [prettier, setPrettier] = useState(true);
  const [dryRun, setDryRun] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ExportReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState<string | null>(null);

  const handleRun = async () => {
    setError(null);
    setReport(null);
    setOutputFilename(null);

    if (!targetPath.trim()) {
      setError('Target path is required');
      return;
    }

    if (filter === 'glob' && !pattern.trim()) {
      setError('Pattern is required when filter is glob');
      return;
    }

    setLoading(true);

    try {
      const options: ExportOptions = {
        targetPath,
        filter,
        pattern: filter === 'glob' ? pattern : undefined,
        exclude: exclude.split(',').map(s => s.trim()),
        maxSize,
        followSymlinks,
        prettier,
        dryRun,
      };

      const response = await runExport(options);
      setReport(response.report);

      if (response.downloadUrl && !dryRun) {
        const filename = response.downloadUrl.split('/').pop();
        if (filename) {
          setOutputFilename(filename);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>md-exporter Demo</h1>
        <p>Export specific files path&content from a given folder/**/* into a single Markdown file</p>
      </header>

      <main className="container">
        <section className="form-section">
          <h2>Configuration</h2>

          <div className="form-group">
            <label htmlFor="targetPath">Target Path *</label>
            <input
              id="targetPath"
              type="text"
              placeholder="e.g., ./src"
              value={targetPath}
              onChange={e => setTargetPath(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="filter">Filter</label>
              <select value={filter} onChange={e => setFilter(e.target.value as any)}>
                <option value="all">All Files</option>
                <option value="tsx">TypeScript/TSX</option>
                <option value="css">CSS</option>
                <option value="md">Markdown</option>
                <option value="glob">Custom Glob</option>
              </select>
            </div>

            {filter === 'glob' && (
              <div className="form-group">
                <label htmlFor="pattern">Pattern *</label>
                <input
                  id="pattern"
                  type="text"
                  placeholder="e.g., **/*.ts"
                  value={pattern}
                  onChange={e => setPattern(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="exclude">Exclude (comma-separated)</label>
            <input
              id="exclude"
              type="text"
              value={exclude}
              onChange={e => setExclude(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxSize">Max Size (MB)</label>
              <input
                id="maxSize"
                type="number"
                min="1"
                value={maxSize}
                onChange={e => setMaxSize(parseInt(e.target.value, 10))}
              />
            </div>

            <div className="form-group checkbox">
              <input
                id="followSymlinks"
                type="checkbox"
                checked={followSymlinks}
                onChange={e => setFollowSymlinks(e.target.checked)}
              />
              <label htmlFor="followSymlinks">Follow Symlinks</label>
            </div>

            <div className="form-group checkbox">
              <input
                id="prettier"
                type="checkbox"
                checked={prettier}
                onChange={e => setPrettier(e.target.checked)}
              />
              <label htmlFor="prettier">Use Prettier</label>
            </div>

            <div className="form-group checkbox">
              <input
                id="dryRun"
                type="checkbox"
                checked={dryRun}
                onChange={e => setDryRun(e.target.checked)}
              />
              <label htmlFor="dryRun">Dry Run</label>
            </div>
          </div>

          <button onClick={handleRun} disabled={loading} className="btn-primary">
            {loading ? 'Running...' : 'Run Export'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </section>

        {report && (
          <section className="results-section">
            <h2>Results</h2>

            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-label">Total Matched</div>
                <div className="summary-value">{report.counts.totalMatched}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Included</div>
                <div className="summary-value">{report.counts.included}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Skipped (Binary)</div>
                <div className="summary-value">{report.counts.skippedBinary}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Skipped (Large)</div>
                <div className="summary-value">{report.counts.skippedLarge}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Skipped (Error)</div>
                <div className="summary-value">{report.counts.skippedError}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Bytes Read</div>
                <div className="summary-value">{(report.bytesRead / 1024).toFixed(1)} KB</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Bytes Written</div>
                <div className="summary-value">{(report.bytesWritten / 1024).toFixed(1)} KB</div>
              </div>
            </div>

            <div className="timings-section">
              <h3>Timings (ms)</h3>
              <div className="timings-grid">
                <div className="timing-item">
                  <span>Discovery</span>
                  <div className="timing-bar">
                    <div
                      className="timing-fill"
                      style={{
                        width: `${(report.timings.discovery / report.timings.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="timing-value">{report.timings.discovery}</span>
                </div>
                <div className="timing-item">
                  <span>Stat</span>
                  <div className="timing-bar">
                    <div
                      className="timing-fill"
                      style={{
                        width: `${(report.timings.stat / report.timings.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="timing-value">{report.timings.stat}</span>
                </div>
                <div className="timing-item">
                  <span>Read</span>
                  <div className="timing-bar">
                    <div
                      className="timing-fill"
                      style={{
                        width: `${(report.timings.read / report.timings.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="timing-value">{report.timings.read}</span>
                </div>
                <div className="timing-item">
                  <span>Render</span>
                  <div className="timing-bar">
                    <div
                      className="timing-fill"
                      style={{
                        width: `${(report.timings.render / report.timings.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="timing-value">{report.timings.render}</span>
                </div>
                <div className="timing-item">
                  <span>Prettier</span>
                  <div className="timing-bar">
                    <div
                      className="timing-fill"
                      style={{
                        width: `${(report.timings.prettier / report.timings.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="timing-value">{report.timings.prettier}</span>
                </div>
                <div className="timing-item">
                  <span>Write</span>
                  <div className="timing-bar">
                    <div
                      className="timing-fill"
                      style={{
                        width: `${(report.timings.write / report.timings.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="timing-value">{report.timings.write}</span>
                </div>
                <div className="timing-item total">
                  <span>Total</span>
                  <div className="timing-bar">
                    <div className="timing-fill" style={{ width: '100%' }} />
                  </div>
                  <span className="timing-value">{report.timings.total}</span>
                </div>
              </div>
            </div>

            {report.skipped.length > 0 && (
              <div className="skipped-section">
                <h3>Skipped Files ({report.skipped.length})</h3>
                <div className="skipped-list">
                  {report.skipped.slice(0, 10).map((file, idx) => (
                    <div key={idx} className="skipped-item">
                      <span className="skipped-path">{file.path}</span>
                      <span className={`skipped-reason reason-${file.reason}`}>{file.reason}</span>
                    </div>
                  ))}
                  {report.skipped.length > 10 && (
                    <div className="skipped-more">
                      +{report.skipped.length - 10} more skipped files
                    </div>
                  )}
                </div>
              </div>
            )}

            {outputFilename && !dryRun && (
              <div className="download-section">
                <button
                  onClick={() => downloadMarkdown(outputFilename)}
                  className="btn-secondary"
                >
                  Download Markdown
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
