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
- [x] Progress indicators: Show spinner and skeleton during upload and conversion
- [ ] Error handling: Display clear, styled error messages for upload and conversion failures (in progress)
- [ ] Download button for single files: Allow users to download converted code as a file (in progress)
- [x] Improved UI: Multi-framework support reflected in UI text and bubble message

**(Diff viewer and history features removed from this phase as decided)**

## Phase 5: Quality, Testing, and Polish
- [ ] Unit/integration tests: For backend and conversion logic
- [ ] E2E tests: Simulate real user flows
- [ ] CI/CD: Automate testing and deployment
- [ ] Documentation: Update README and add user guides

## Testing Layer
- [ ] Validate that converted code actually works (manual and/or automated testing of converted outputs)
- [ ] Optionally, run converted code through linters, compilers, or test suites to catch errors early 