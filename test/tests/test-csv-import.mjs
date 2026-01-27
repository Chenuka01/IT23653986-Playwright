import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const csvPath = path.join(__dirname, '../data.csv');
  console.log('Reading CSV from:', csvPath);
  const records = parse(fs.readFileSync(csvPath), {
    columns: true,
    skip_empty_lines: true
  });
  console.log('Successfully parsed', records.length, 'records');
  const valid = records.filter(r => r['TC ID'] && r['Input']);
  console.log('Valid test records:', valid.length);
} catch (error) {
  console.error('Error:', error.message);
}
