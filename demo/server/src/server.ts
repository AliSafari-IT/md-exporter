import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { runExport } from 'md-exporter';
import type { ExportOptions } from 'md-exporter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

const app = express();
const PORT = 5199;
const OUTPUT_DIR = resolve(__dirname, '..', '.output');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

async function ensureOutputDir() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    if ((error as any).code !== 'EEXIST') {
      throw error;
    }
  }
}

app.post('/api/run', async (req, res) => {
  try {
    const options: ExportOptions = req.body;

    if (!options.targetPath || !options.targetPath.trim()) {
      return res.status(400).json({ error: 'targetPath is required' });
    }

    if (options.filter === 'glob' && !options.pattern) {
      return res.status(400).json({ error: 'pattern is required when filter=glob' });
    }

    await ensureOutputDir();

    const exportOptions: ExportOptions = {
      ...options,
      outDir: OUTPUT_DIR,
      dryRun: options.dryRun || false,
      verbose: false,
    };

    const result = await runExport(exportOptions);

    const response: any = {
      report: result.report,
    };

    if (result.outputMarkdownPath && !options.dryRun) {
      const filename = result.outputMarkdownPath.split(/[\\/]/).pop();
      if (filename) {
        response.downloadUrl = `/api/download/${filename}`;
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/download/:file', async (req, res) => {
  try {
    const filename = req.params.file;

    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = resolve(OUTPUT_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (error) {
    console.error('Download error:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
