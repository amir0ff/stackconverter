# Testing Documentation

## Overview

StackConverter has a comprehensive test suite covering critical backend functionality with 40 unit tests and 10 integration tests across 7 test suites. All tests are currently passing.

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
├── server.test.js     # Server configuration
└── integration.test.js # End-to-end workflows
```

## Test Categories

### Unit Tests (40 tests)

#### Core Routes (24 tests)
- `/convert` - Code conversion between frameworks (6 tests)
- `/detect-stack` - Automatic framework detection (8 tests)
- `/upload` - File upload handling (6 tests)
- `/batch-convert` - Batch file conversion (4 tests)

#### Utilities (6 tests)
- `buildPrompt()` - AI prompt generation for all 20+ stack combinations (2 tests)
- `buildDetectionPrompt()` - Framework detection prompts (2 tests)
- `stripCodeBlock()` - Code cleaning with edge cases (4 tests)
- `verifyCaptcha()` - CAPTCHA verification (1 test)

#### Server (6 tests)
- Server startup validation
- Route mounting verification
- Basic endpoint functionality
- 404 error handling

### Integration Tests (10 tests)
- **Complete Conversion Workflows** - End-to-end React↔Vue conversions (2 tests)
- **Batch Conversion Workflow** - Batch conversion error handling (1 test)
- **Error Handling & Edge Cases** - Malformed requests, missing fields, empty code (3 tests)
- **Cross-Stack Conversion Matrix** - Key framework combinations (2 tests)
- **Health Check & Server Status** - Server health and 404 handling (2 tests)

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