# Swift Translator Automation Testing Project

## Project Overview
This project contains automated tests for the Swift Translator web application (https://www.swifttranslator.com/) using Playwright framework. The tests validate Singlish to Sinhala translation functionality across multiple browsers.

## Test Coverage
- **Total Test Cases**: 37 (35 CSV tests + 2 example tests)
- **Positive Functional Tests**: 24
- **Negative Functional Tests**: 10
- **UI Tests**: 1

### Test Categories
1. **Functional Tests**
   - Simple sentences
   - Compound and complex sentences
   - Questions (interrogative)
   - Commands (imperative)
   - Different tenses (past, present, future)
   - Mixed language (Singlish + English terms)
   - Special characters and punctuation
   - Numbers, dates, and currency formats

2. **Negative Tests**
   - Brand name preservation failures
   - Technical term transliteration errors
   - URL and email format preservation
   - Mixed language handling issues

3. **UI Tests**
   - Page visibility and element presence

## Project Structure
```
IT23653986-Playwright/
├── test/
│   ├── tests/
│   │   ├── translator.spec.ts    # Main test file (CSV-driven tests)
│   │   └── example.spec.ts       # Playwright default example
│   ├── data.csv                  # Test data (35 test cases)
│   ├── check-csv.js              # CSV validation script
│   ├── playwright.config.ts      # Playwright configuration
│   ├── package.json              # Dependencies
│   └── tsconfig.json             # TypeScript configuration
├── package.json                  # Root package.json
└── README.md                     # This file
```

## Technologies Used
- **Testing Framework**: Playwright (v1.58.0)
- **Language**: TypeScript
- **Test Data**: CSV file with 35 test cases
- **CSV Parser**: csv-parse (v6.1.0)
- **Browsers**: Chromium, Firefox, WebKit

## Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd playwright-it23653986
```

### 2. Install Dependencies
```bash
# Install test dependencies
cd test
npm install

# This installs:
# - @playwright/test
# - csv-parse
# - @types/node
```

### 3. Install Playwright Browsers
```bash
cd test
npx playwright install
```

## Running Tests

### Run All Tests
```bash
# From root directory
npm test

# OR from test directory
cd test
npx playwright test
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed

# OR
cd test
npx playwright test --headed
```

### Run Tests in UI Mode (Interactive)
```bash
npm run test:ui

# OR
cd test
npx playwright test --ui
```

### Run Tests for Specific Browser
```bash
# Chromium only
npm run test:chromium

# Firefox only
cd test
npx playwright test --project=firefox

# WebKit only
cd test
npx playwright test --project=webkit
```

### View Test Report
```bash
cd test
npx playwright show-report
```

## Test Data Format

The test data is stored in `test/data.csv` with the following columns:
- **TC ID**: Test Case ID (e.g., Pos_Fun_0001)
- **Test case name**: Description of the test
- **Input length type**: S (Short), M (Medium), L (Long)
- **Input**: Singlish text to translate
- **Expected output**: Expected Sinhala translation
- **Actual output**: Actual result from the system
- **Status**: Pass/Fail
- **Accuracy justification**: Description of test coverage
- **What is covered by the test**: Test category

## Configuration

### Playwright Configuration (`test/playwright.config.ts`)
- **Browsers**: Chromium, Firefox, WebKit
- **Parallel Execution**: Enabled (6 workers)
- **Timeout**: 30 seconds per test
- **Base URL**: https://www.swifttranslator.com/
- **Screenshots**: On failure
- **Video**: On first retry
- **Trace**: On first retry

## Test Features

### Key Features Tested
1. ✅ Translation accuracy for common phrases
2. ✅ Preservation of English technical terms
3. ✅ Handling of numbers, dates, and currency
4. ✅ Punctuation and special characters
5. ✅ Mixed language support (Singlish + English)
6. ✅ UI element visibility
7. ✅ Real-time translation updates

### Validation Approach
- Tests verify that translation output is generated (not empty)
- Console logs capture actual vs expected output for manual review
- Each test logs: Test ID, Input, Actual Output, Expected Output, Status

## Known Issues
- ~~CSV file encoding: BOM issue~~ ✅ **FIXED** - Code now automatically removes BOM before parsing
- Translation output echoes input instead of translating (translator may not be working as expected)
- Tests validate output presence rather than exact translation match

## Test Execution Summary

### Expected Results
- **Total Tests**: 111 (37 test cases × 3 browsers)
- **Browser Coverage**: 
  - Chromium: 37 tests
  - Firefox: 37 tests
  - WebKit: 37 tests

### Success Criteria
- All tests should execute successfully
- Translation output should be generated for all inputs
- UI elements should be visible and accessible
- Tests should complete within timeout limits

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-test`)
3. Commit your changes (`git commit -am 'Add new test'`)
4. Push to the branch (`git push origin feature/new-test`)
5. Create a Pull Request

## Test Maintenance

### Adding New Tests
1. Add test data to `test/data.csv`
2. Follow the existing CSV format
3. Run tests to verify: `npm test`

### Updating Test Logic
- Main test file: `test/tests/translator.spec.ts`
- Modify selectors if UI changes
- Adjust wait times if needed for slower networks

## Troubleshooting

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check network connection
- Verify website is accessible

### CSV Encoding Issues
- ✅ BOM encoding is handled automatically by the test code
- CSV file contains UTF-8 BOM which is stripped during parsing
- Use Excel or Google Sheets to edit
- Ensure proper Sinhala font support

### Browser Issues
- Reinstall browsers: `npx playwright install --force`
- Update Playwright: `npm update @playwright/test`

## Author Information
- **Project**: Swift Translator Automation Testing
- **Framework**: Playwright + TypeScript
- **Date**: January 2026

## License
This project is created for educational purposes as part of a university assignment.

## References
- Playwright Documentation: https://playwright.dev/
- TypeScript Documentation: https://www.typescriptlang.org/
- Swift Translator: https://www.swifttranslator.com/
