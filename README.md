# md-exporter

A cross-platform CLI tool that exports files from a target folder into a single Markdown file with per-file headers and fenced code blocks.

## Installation

```bash
npm install -g @asafarim/md-exporter
# or
pnpm add -g @asafarim/md-exporter
```

## Quick Start

After installation, you can use the CLI directly on your local machine to export any folder:

```bash
md-exporter D:\your\folder\path --filter all --out-dir ./exports
```

The tool runs **locally on your machine** and has full access to your file system. All file paths are resolved relative to your current working directory or as absolute paths.

## Built-in Help

Use the built-in help command to see all available options:

```bash
# Show help
md-exporter --help

# Show version
md-exporter --version
```

The help command displays all available options with descriptions and examples.

## Testing During Development

If you're developing or testing the package locally:

```bash
# Install globally from local package
cd D:\repos\npm-packages\packages\md-exporter
npm install -g .

# Or use npx without global install
npx . --help

# Or run directly
node dist/cli.js --help

# Or use npm link for development
npm link
```

## Usage

```bash
md-exporter <targetPath> [options]
```

### Options

- `--filter <all|tsx|css|md|json|glob>` - File filter type (default: all)
- `--pattern <glob>` - Glob pattern (required when filter=glob)
- `--exclude <csv>` - Comma-separated directory exclusions (default: "node_modules,.git,dist")
- `--max-size <mb>` - Maximum file size in MB (default: 5)
- `--follow-symlinks` - Follow symbolic links (default: false)
- `--dry-run` - Perform a dry run without writing output (default: false)
- `--verbose` - Enable verbose logging (default: false)
- `--out-dir <path>` - Output directory (default: current working directory)
- `--eol <lf|crlf>` - End-of-line style (default: lf)
- `--report-json <path>` - Write JSON metrics report to specified path
- `--no-prettier` - Skip Prettier formatting

## Examples

### Export all TypeScript files from a folder

```bash
md-exporter ./src --filter tsx --out-dir ./exports
```

### Export all JSON files from a folder

```bash
md-exporter ./src --filter json --out-dir ./exports
```

### Export with custom glob pattern

```bash
md-exporter D:\my-project\src --filter glob --pattern "**/*.{ts,tsx,js}" --out-dir ./exports
```

### Export with exclusions

```bash
md-exporter ./src --filter all --exclude "node_modules,.git,dist,build" --out-dir ./exports
```

### Dry run (preview without writing)

```bash
md-exporter ./src --dry-run --verbose
```

## Programmatic API

Use the library in your Node.js/TypeScript projects:

```typescript
import { runExport } from '@asafarim/md-exporter';

const result = await runExport({
  targetPath: './src',
  filter: 'tsx',
  exclude: ['node_modules', '.git'],
  maxSize: 5,
  outDir: './exports',
  dryRun: false,
  verbose: true
});

console.log(result.report);
```

## Important: Local vs. Server Usage

### Local CLI (Recommended)

When you install and run `md-exporter` as a CLI tool, it runs **directly on your machine** with full access to your local file system. You can export any folder path:

```bash
# Windows
md-exporter D:\Users\YourName\Documents\MyProject\src

# macOS/Linux
md-exporter /Users/yourname/Documents/MyProject/src
```

### Web Demo (Development Only)

The included React demo app with a Node.js server is for **demonstration purposes only**. It requires:

1. The server running on your local machine
2. The server having access to your local file system
3. Both web UI and server running simultaneously

The demo is useful for testing and visualization, but for production use, **use the CLI directly on your machine** where you need to export files.

## Output

The tool generates a Markdown file with:
- Timestamp-based filename: `YYYYMMDD_HHMMSS_{filter}.md`
- Per-file headers: `file {absolute-path}:`
- Syntax-highlighted code blocks with language tags
- Optional JSON report with metrics and timings

## Publishing

This package is set up for automated publishing to NPM:

### Local Version Bump & Publish

```bash
# Bump version and publish automatically
npm version patch  # or minor, major
```

This will:
1. Build the package
2. Update version in package.json
3. Commit the version change
4. Push to GitHub
5. Publish to NPM

### GitHub Actions

The package also uses GitHub Actions for automatic publishing when tags are pushed:

```bash
# Create and push a tag to trigger publishing
git tag v0.2.0
git push origin v0.2.0
```

**Setup Required:**
- Add `NPM_TOKEN` to GitHub repository secrets
- Ensure you have publish access to the `@asafarim/md-exporter` package
