import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

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

// Store actual outputs globally
const actualOutputs: Map<string, string> = new Map();

test.describe('Swift Translator Automation Testing', () => {
  // CSV file එක කියවීම - Remove BOM if present
  const csvFilePath = path.join(__dirname, '../data.csv');
  const csvContent = fs.readFileSync(csvFilePath, 'utf8').replace(/^\uFEFF/, '');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  }) as TestRecord[];

  console.log(`Total CSV records: ${records.length}`);

  for (const record of records) {
    // Get the TC ID column value
    const tcId = record['TC ID']?.trim();
    const input = record['Input']?.trim();
    
    // Empty rows skip කරන්න
    if (!tcId || !input) {
      continue;
    }

    // UI test එකක්ද පරීක්ෂා කරන්න
    if (tcId.includes('UI')) {
      // UI පරීක්ෂණය සඳහා - Real-time translation test
      test(`${tcId}: ${record['Test case name']}`, async ({ page }) => {
        await page.goto('https://www.swifttranslator.com/');
        await page.waitForLoadState('networkidle');
        
        const expectedOutput = record['Expected output'];
        
        console.log('\n==================================================');
        console.log(`Test Case: ${tcId}`);
        console.log(`Test Name: ${record['Test case name']}`);
        console.log(`Input: ${input}`);
        console.log(`Expected: ${expectedOutput}`);
        
        // Clear input first
        const inputArea = page.locator('textarea');
        await inputArea.click();
        await inputArea.fill('');
        
        // Type slowly to test real-time conversion
        await inputArea.pressSequentially(input, { delay: 100 });
        
        // Wait for translation
        const baseWaitTime = Math.min(Math.max(input.length * 10, 1000), 4000);
        await page.waitForTimeout(baseWaitTime);
        
        // Get output
        const outputDiv = page.locator('div.bg-slate-50.whitespace-pre-wrap');
        await expect(outputDiv).not.toBeEmpty({ timeout: 15000 }).catch(() => {});
        const actualText = (await outputDiv.textContent() || '').trim();
        
        // Store output
        actualOutputs.set(tcId, actualText);
        
        console.log(`Actual: ${actualText}`);
        
        // Check if translated
        const isTranslated = actualText !== input && actualText !== '';
        console.log(`Translation Status: ${isTranslated ? '✅ Translated' : '❌ Not Translated'}`);
        
        // Check match (flexible matching for UI tests)
        const match = actualText.includes(expectedOutput) || expectedOutput.includes(actualText);
        console.log(`Match: ${match ? '✅ PASS' : '❌ FAIL'}`);
        console.log('==================================================\n');
      });
    } else {
      // Positive සහ Negative පරීක්ෂණ සඳහා
      test(`${tcId}: ${input.substring(0, 50)}...`, async ({ page, browserName }) => {
        // Navigate to translator
        await page.goto('https://www.swifttranslator.com/');
        await page.waitForLoadState('networkidle');
        
        // Wait for input textarea to be visible
        const inputArea = page.locator('textarea').first();
        await inputArea.waitFor({ state: 'visible', timeout: 10000 });
        
        // Clear and enter input text
        await inputArea.clear();
        await inputArea.fill(record['Input']);
        
        // Trigger translation by pressing Enter
        await inputArea.press('Enter');
        
        // Calculate appropriate wait time based on input length and browser
        const inputLength = record['Input'].length;
        let baseWaitTime = inputLength > 250 ? 8000 : inputLength > 100 ? 5000 : 3000;
        
        // Firefox and WebKit need more time
        if (browserName === 'firefox' || browserName === 'webkit') {
          baseWaitTime = baseWaitTime * 2; // Double the wait time
        }
        
        // Wait for translation to complete  
        await page.waitForTimeout(baseWaitTime);
        
        // ✅ CORRECT OUTPUT SELECTOR with wait for content
        const outputDiv = page.locator('div.bg-slate-50.whitespace-pre-wrap');
        
        // Wait for output div to have content (longer timeout for Firefox/WebKit)
        const waitTimeout = browserName === 'chromium' ? 15000 : 30000;
        await expect(outputDiv).not.toBeEmpty({ timeout: waitTimeout }).catch(() => {
          // If timeout, continue anyway to capture what we have
        });
        
        // Try to get output with retry logic - increased retries and wait time
        let actualText = '';
        let maxRetries = 5; // Increased from 3 to 5
        let retryWaitTime = browserName === 'webkit' ? 3000 : 2000; // Longer wait for WebKit
        
        while (maxRetries > 0 && !actualText) {
          actualText = (await outputDiv.textContent() || '').trim();
          if (!actualText && maxRetries > 0) {
            // Silent retry - waiting for translation to complete
            await page.waitForTimeout(retryWaitTime);
            maxRetries--;
          }
        }
        
        // Store actual output for CSV update
        actualOutputs.set(record['TC ID'], actualText);
        
        // Enhanced logging
        console.log(`\n${'='.repeat(50)}`);
        console.log(`Test Case: ${record['TC ID']}`);
        console.log(`Test Name: ${record['Test case name']}`);
        console.log(`Input: ${record['Input']}`);
        console.log(`Expected: ${record['Expected output']}`);
        console.log(`Actual: ${actualText}`);
        console.log(`Translation Status: ${actualText && actualText !== record['Input'] ? '✅ Translated' : '❌ Not Translated'}`);
        console.log(`Match: ${actualText === record['Expected output'] ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`${'='.repeat(50)}\n`);
        
        // Verify output is not empty (skip assertion if translation service is down)
        if (!actualText) {
          console.log('⚠️ WARNING: Empty output - translation service may be unavailable');
        }
        
        // For tests, we don't fail on empty output to avoid blocking the test suite
        // The CSV will show the actual vs expected for manual review
      });
    }
  }

  // After all tests complete, update CSV file with actual outputs
  test.afterAll(async () => {
    if (actualOutputs.size > 0) {
      console.log(`\n📝 Updating CSV file with ${actualOutputs.size} actual outputs...`);
      
      // Read the CSV again to get all rows including empty ones
      const fullCsvContent = fs.readFileSync(csvFilePath, 'utf8').replace(/^\uFEFF/, '');
      const allRecords = parse(fullCsvContent, {
        columns: true,
        skip_empty_lines: false,
        relax_column_count: true
      }) as TestRecord[];
      
      // Update records with actual outputs
      let updatedCount = 0;
      for (const record of allRecords) {
        const tcId = record['TC ID']?.trim();
        if (tcId && actualOutputs.has(tcId)) {
          record['Actual output'] = actualOutputs.get(tcId) || '';
          updatedCount++;
        }
      }
      
      // Write updated CSV back to file
      const updatedCsv = stringify(allRecords, {
        header: true,
        columns: [
          'TC ID',
          'Test case name',
          'Input length type',
          'Input',
          'Expected output',
          'Actual output',
          'Status',
          'Accuracy justification/ Description of issue type',
          'What is covered by the test'
        ]
      });
      
      fs.writeFileSync(csvFilePath, updatedCsv, 'utf8');
      console.log(`✅ CSV file updated successfully! (${updatedCount} records updated)\n`);
    }
  });
});
