# Stack Converter Development Roadmap

## Phase 1: Core AI Integration ✅ (Completed)
- Integrated with Google Gemini AI (`gemini-2.0-flash`)
- Set up Node.js/Express backend for secure LLM API calls
- Frontend now uses backend for real AI-powered code conversion

## Phase 2: File Upload & Batch Conversion ✅ (Completed)
- ✅ File upload UI: Let users upload a zip file or folder
- ✅ Backend file handling: Unzip and parse the project structure
- ✅ Batch conversion: Send each file to the AI for conversion
- ✅ Repackage output: Zip the converted project for download
- ✅ Enhanced logging: Development vs production logging with token usage tracking

## Phase 3: Stack/Framework Expansion ✅ (Completed)
- ✅ Expand dropdowns: Added popular frameworks (React, Vue, Angular, Svelte, SolidJS, Preact)
- ✅ Prompt engineering: Tailored AI prompts for each stack-to-stack conversion with specific instructions
- ✅ Proper file extensions: Each framework gets correct file extensions (.vue, .svelte, .tsx, etc.)
- ✅ Fallback logic: Generic conversion for unsupported stack combinations

## Phase 4: UI/UX Enhancements (In Progress)
- ✅ Progress indicators: Show spinner and skeleton during upload and conversion
- ✅ Error handling: Display clear, styled error messages for upload and conversion failures
- ✅ Download button for single files: Allow users to download converted code as a file
- ✅ Improved UI: Multi-framework support reflected in UI text and bubble message
- ✅ Improved stack switching: When switching source stack to match target after conversion, source code is set to last converted result
- ✅ Same-stack conversion UX: Converted code now matches source code exactly for same-stack conversions
- ✅ Instant demo mapping fixes: Escaped Angular template literals to prevent TSX parse errors

**(Diff viewer and history features removed from this phase as decided)**

## Phase 5: Quality, Testing, and Polish ✅ (Completed)
- ✅ Unit/integration tests: Comprehensive backend test suite with 45+ tests
- ✅ Security tests: Input validation, code cleaning, edge cases
- ✅ Middleware tests: CORS, error handling, CAPTCHA session
- ✅ Route tests: All API endpoints with mocked responses
- ✅ Integration tests: End-to-end conversion workflows
- ✅ Server tests: Health checks, route mounting, error handling
- [ ] E2E tests: Simulate real user flows (deferred to future)
- [x] CI/CD: Automate testing and deployment (now uses GitHub Actions, rsync, PM2, and public API subdomain)
- [x] Documentation: Update README and add comprehensive testing docs

## Testing Layer ✅ (Completed)
- ✅ Comprehensive test suite covering all critical backend functionality
- ✅ 9 test suites with 45+ tests across routes, middleware, utilities, security, and integration
- ✅ Mocked AI responses for consistent testing without API costs
- ✅ Error handling and edge case coverage
- [ ] Validate that converted code actually works (manual and/or automated testing of converted outputs)
- [ ] Optionally, run converted code through linters, compilers, or test suites to catch errors early 