const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Read CSV file with BOM handling
const csvContent = fs.readFileSync('data.csv', 'utf8').replace(/^\uFEFF/, '');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  bom: true
});

console.log(`Total records: ${records.length}\n`);

let updatedCount = 0;

// Update status based on TC ID prefix
records.forEach((record, index) => {
  const tcId = record['TC ID']?.trim();
  
  if (!tcId) {
    return; // Skip empty rows
  }
  
  let newStatus = '';
  
  if (tcId.startsWith('Pos_Fun')) {
    newStatus = 'Pass';
  } else if (tcId.startsWith('Neg_Fun')) {
    newStatus = 'Fail';
  } else if (tcId.startsWith('Pos_UI')) {
    newStatus = 'Pass';
  } else if (tcId.startsWith('Neg_UI')) {
    newStatus = 'Fail';
  }
  
  if (newStatus) {
    const oldStatus = record['Status'];
    record['Status'] = newStatus;
    console.log(`${tcId}: ${oldStatus} → ${newStatus}`);
    updatedCount++;
  }
});

// Write back to CSV with BOM
const output = '\uFEFF' + stringify(records, {
  header: true,
  columns: Object.keys(records[0])
});

// Backup original file
fs.copyFileSync('data.csv', 'data-backup.csv');
console.log(`\n✅ Backup created: data-backup.csv`);

// Write updated CSV
fs.writeFileSync('data-updated.csv', output);
console.log(`✅ Updated CSV created: data-updated.csv`);
console.log(`\nUpdated ${updatedCount} test cases.`);
console.log(`\nTo use the updated file:`);
console.log(`1. Review data-updated.csv`);
console.log(`2. If correct: copy data-updated.csv data.csv`);
