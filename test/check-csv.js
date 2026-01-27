const fs = require('fs');
const { parse } = require('csv-parse/sync');

const records = parse(fs.readFileSync('data.csv'), {
  columns: true,
  skip_empty_lines: true
});

console.log('Total rows:', records.length);
console.log('\nFirst 5 records:');
records.slice(0, 5).forEach((r, i) => {
  console.log(`\n${i + 1}.`, JSON.stringify(r, null, 2));
});

console.log('\nColumn names:');
Object.keys(records[0]).forEach((key, i) => {
  console.log(`${i + 1}. "${key}" (length: ${key.length})`);
});

console.log('\nDEBUG first record:');
const first = records[0];
const tcIdKey = Object.keys(first).find(k => k.includes('TC'));
console.log('TC ID key found:', `"${tcIdKey}"`);
console.log('TC ID value:', `"${first[tcIdKey]}"`);

const valid = records.filter(r => {
  const tcId = r[tcIdKey];
  const input = r['Input'];
  return tcId && tcId.trim().length > 0 && input && input.trim().length > 0;
});
console.log(`\nRecords with TC ID and Input: ${valid.length}`);
valid.forEach((r, i) => {
  console.log(`${i + 1}. ${r[tcIdKey]}: ${r['Input'].substring(0, 50)}`);
});
