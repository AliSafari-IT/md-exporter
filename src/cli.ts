#!/usr/bin/env node

import { parseArgs } from './core/args';
import { runExport } from './core/runner';

async function main() {
  try {
    const options = parseArgs();
    await runExport(options);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
