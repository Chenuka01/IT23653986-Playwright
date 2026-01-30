import { test } from '@playwright/test';

test('Inspect Translator DOM Structure', async ({ page }) => {
  await page.goto('https://www.swifttranslator.com/');
  await page.waitForLoadState('networkidle');
  
  // Enter test input
  const inputArea = page.locator('textarea').first();
  await inputArea.waitFor({ state: 'visible', timeout: 10000 });
  await inputArea.fill('mama adha Java panthi yanavaa.');
  await inputArea.press('Enter');
  
  // Wait for translation
  await page.waitForTimeout(5000);
  
  // Get page HTML structure
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('\n=====FULL PAGE HTML=====');
  console.log(bodyHTML);
  
  // Get all textareas
  const allTextareas = page.locator('textarea');
  const textareaCount = await allTextareas.count();
  console.log(`\n=====FOUND ${textareaCount} TEXTAREAS=====`);
  
  for (let i = 0; i < textareaCount; i++) {
    const value = await allTextareas.nth(i).inputValue();
    const placeholder = await allTextareas.nth(i).getAttribute('placeholder');
    console.log(`Textarea ${i}: placeholder="${placeholder}", value="${value}"`);
  }
  
  // Get all divs with text content
  const divsWithSinhala = page.locator('div:has-text("Sinhala")');
  const sinhalaCount = await divsWithSinhala.count();
  console.log(`\n=====FOUND ${sinhalaCount} DIVS WITH "Sinhala"=====`);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/dom-inspection.png', fullPage: true });
  console.log('\nScreenshot saved: test-results/dom-inspection.png');
});
