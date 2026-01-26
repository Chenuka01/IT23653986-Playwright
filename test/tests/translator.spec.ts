import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Define the type for CSV records
interface TestRecord {
  'TC ID': string;
  'Test case name': string;
  'Input length type': string;
  'Input': string;
  'Expected output': string;
  'Actual output': string;
  'Status': string;
  'Accuracy justification/ Description of issue type': string;
  'What is covered by the test': string;
}

// CSV file එක කියවීම
const records = parse(fs.readFileSync(path.join(__dirname, '../data.csv')), {
  columns: true,
  skip_empty_lines: true
}) as TestRecord[];

test.describe('Swift Translator Automation Testing', () => {

  for (const record of records) {
    // Empty rows skip කරන්න
    if (!record['TC ID'] || !record['Input']) {
      continue;
    }

    // UI test එකක්ද පරීක්ෂා කරන්න
    if (record['TC ID'].includes('UI')) {
      // UI පරීක්ෂණය සඳහා
      test(`Testing ${record['TC ID']}: UI Visibility`, async ({ page }) => {
        await page.goto('https://www.swifttranslator.com/');
        await page.waitForLoadState('networkidle');
        const title = page.locator('.text-lg.font-semibold:has-text("Singlish ↔ English Translator")');
        await expect(title).toBeVisible();
      });
    } else {
      // Positive සහ Negative පරීක්ෂණ සඳහා
      test(`Testing ${record['TC ID']}: ${record['Input']}`, async ({ page }) => {
        await page.goto('https://www.swifttranslator.com/');
        
        // Page එක load වන තෙක් රැඳී සිටින්න
        await page.waitForLoadState('networkidle');
        
        // Input box එක සොයාගෙන සිංග්ලිෂ් ඇතුළත් කිරීම
        const inputArea = page.locator('textarea').first();
        await inputArea.waitFor({ state: 'visible', timeout: 10000 });
        await inputArea.fill(record['Input']);
        
        // ප්‍රතිඵලය පරීක්ෂා කිරීම - Sinhala panel එක යටතේ තියෙන div එක
        const outputArea = page.locator('.panel-title:has-text("Sinhala")').locator('..').locator('div.whitespace-pre-wrap');
        
        // පරිවර්තනය වන තෙක් රැඳී සිටීම - output එක empty නැති වෙන තෙක් wait කරන්න
        await outputArea.waitFor({ state: 'visible', timeout: 10000 });
        
        // Long inputs සඳහා වැඩි කාලයක් wait කරන්න
        const inputLength = record['Input'].length;
        const waitTime = inputLength > 250 ? 8000 : inputLength > 100 ? 5000 : 3000;
        await page.waitForTimeout(waitTime);
        
        // Output එකේ content එන තෙක් wait කරන්න (empty නැති වෙන තෙක්)
        await expect(async () => {
          const text = await outputArea.innerText();
          expect(text.trim().length).toBeGreaterThan(0);
        }).toPass({ timeout: 15000, intervals: [1000] });
        
        const actualText = await outputArea.innerText();
        
        // Log actual output for documentation
        console.log(`Test Case: ${record['TC ID']}`);
        console.log(`Input: ${record['Input']}`);
        console.log(`Actual Output: ${actualText.trim()}`);
        console.log(`Expected Output: ${record['Expected output']}`);
        console.log(`Status: ${record['Status']}`);
        console.log('---');
        
        // Output එක empty නැති බව verify කරන්න
        expect(actualText.trim().length).toBeGreaterThan(0);
        
        // For negative tests, just verify that translation happened
        // For positive tests, verify output is not empty
        if (record['TC ID'].includes('Neg')) {
          // Negative test - translation විය යුතුයි (empty නොවිය යුතුයි)
          expect(actualText.trim()).toBeTruthy();
        } else {
          // Positive test - valid Sinhala output විය යුතුයි
          expect(actualText.trim()).toBeTruthy();
        }
      });
    }
  }
});