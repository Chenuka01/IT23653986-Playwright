import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

(async () => {
  const summaryPath = path.join(__dirname, 'test-summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.error('Summary JSON not found. Run the tests first to generate test-summary.json');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

  const rows = data.map((r) => `
    <tr>
      <td>${r.tcId}</td>
      <td>${escapeHtml(r.testName)}</td>
      <td>${escapeHtml(r.input)}</td>
      <td>${escapeHtml(r.expected)}</td>
      <td>${escapeHtml(r.actual)}</td>
      <td style="text-align:center">${r.status}</td>
    </tr>
  `).join('\n');

  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Test Summary</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; }
      th { background: #f4f4f4; }
      td { vertical-align: top; }
      .pass { color: green; font-weight: bold; }
      .fail { color: red; font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>Test Summary (CSV tests)</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <table>
      <thead>
        <tr>
          <th style="width:8%">TC ID</th>
          <th style="width:20%">Test Name</th>
          <th style="width:20%">Input</th>
          <th style="width:20%">Expected</th>
          <th style="width:20%">Actual</th>
          <th style="width:7%">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </body>
  </html>
  `;

  const htmlPath = path.join(__dirname, 'test-summary.html');
  fs.writeFileSync(htmlPath, html, 'utf8');

  const pdfPath = path.join(__dirname, 'test-summary.pdf');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath);
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  await browser.close();

  console.log(`PDF generated at ${pdfPath}`);
})();

function escapeHtml(unsafe) {
  if (!unsafe && unsafe !== '') return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
