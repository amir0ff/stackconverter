# Testing Documentation

## Overview

StackConverter has a focused test suite covering critical backend functionality with 40 tests across 6 test suites. All tests are currently passing.

## Running Tests

```bash
# All tests
pnpm test

# With coverage
pnpm test:coverage

# From root directory
pnpm test:backend
```

## Test Structure

```
backend/__tests__/
├── routes/            # API endpoints
├── utils/             # Utility functions
└── server.test.js     # Server configuration
```

## Test Categories

### Core Routes (24 tests)
- `/convert` - Code conversion between frameworks
- `/detect-stack` - Automatic framework detection
- `/upload` - File upload handling
- `/batch-convert` - Batch file conversion

### Utilities (8 tests)
- `buildPrompt()` - AI prompt generation for all 20+ stack combinations
- `buildDetectionPrompt()` - Framework detection prompts
- `stripCodeBlock()` - Code cleaning with edge cases
- `verifyCaptcha()` - CAPTCHA verification

### Server (8 tests)
- Server startup validation
- Route mounting verification
- Basic endpoint functionality
- 404 error handling

## Test Configuration

- **Environment**: Node.js with Jest
- **Mocking**: External dependencies (AI, file system, APIs)
- **Coverage**: HTML and console output
- **Timeout**: 10 seconds per test

## Error Scenarios Tested

- API errors (timeouts, rate limiting)
- Input validation (empty code, malformed JSON)
- Security (file upload validation, dangerous file types)
- CORS validation
- Large payload handling