# Dual N-Back Build Fix Plan

## Issues Identified:
1. Missing `react-router-dom` dependency in web app (currently using @tanstack/react-router)
2. Missing exports from @dual-n-back/shared package (Mode, StimulusPacket, UserResponse, etc.)
3. Missing utility functions in shared package (getRandomPosition, getRandomConsonant, etc.)
4. Missing constants in shared package (DEFAULT_BLOCK_SIZE, DEFAULT_ISI, etc.)
5. Missing WebSocket types (WSEvent, WSMessage)
6. Missing compression dependency in API
7. TypeScript configuration issues with shared package imports

## Todo Items:

### Phase 1: Fix Shared Package Exports
- [ ] 1. Add missing types to shared package (Mode, StimulusPacket, UserResponse, WSEvent, WSMessage)
- [ ] 2. Add missing constants to shared package (DEFAULT_BLOCK_SIZE, DEFAULT_ISI, PROMOTION_THRESHOLD, DEMOTION_THRESHOLD)
- [ ] 3. Add missing utility functions to shared package (getRandomPosition, getRandomConsonant, generateUUID)
- [ ] 4. Update shared package exports to include all new types and functions

### Phase 2: Fix Web App Dependencies
- [ ] 5. Install react-router-dom dependency in web app
- [ ] 6. Update web app imports to use correct router library
- [ ] 7. Fix StreamType enum usage in web app (convert to const values)

### Phase 3: Fix API Dependencies and Config
- [ ] 8. Install missing compression dependency in API
- [ ] 9. Fix TypeScript rootDir configuration in API
- [ ] 10. Update API imports to use correct shared package exports

### Phase 4: Testing and Cleanup
- [ ] 11. Run build to verify all errors are resolved
- [ ] 12. Test basic functionality to ensure changes work correctly
- [ ] 13. Clean up any unused imports or code

## Strategy:
- Make minimal changes to fix build errors
- Keep existing functionality intact
- Focus on missing dependencies and exports rather than major refactoring
- Test incrementally after each phase