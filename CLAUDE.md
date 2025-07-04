# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Dual N-Back Trainer** - a web-based cognitive training game supporting three difficulty tiers (Dual, Quad, Penta) with offline-first architecture. The project follows a monorepo structure with separate packages for frontend and backend.

**Current Status**: Phase 2 - Dual Engine Implementation (complete monorepo setup)

## Key Commands

### Development
```bash
# Start both frontend and backend
npm run dev

# Start individually
npm run dev:frontend    # http://localhost:3000
npm run dev:backend     # http://localhost:3001

# Build all packages
npm run build
npm run build:frontend
npm run build:backend
```

### Testing
```bash
# Run all tests
npm run test

# Package-specific tests
npm run test --workspace=frontend
npm run test --workspace=backend
```

### Linting & Type Checking
```bash
# Lint all packages
npm run lint

# Type checking (check individual package.json files for specific commands)
```

### Database (Backend)
```bash
cd packages/backend
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:studio      # Open Prisma Studio
```

## Architecture

### Monorepo Structure
```
dual-n-back/
├── packages/
│   ├── frontend/           # React + Vite + TypeScript
│   ├── backend/            # Node.js + Express + TypeScript  
│   └── shared/             # Shared types & utilities
└── ...
```

### Technology Stack
- **Frontend**: React 18, Vite, TypeScript, Zustand (state), Tailwind CSS
- **Backend**: Node.js 22, Express 5, TypeScript, Prisma 5, SQLite
- **Graphics**: PixiJS 8 (WebGL rendering)
- **Audio**: Web Audio API + Howler.js
- **Animation**: Framer Motion
- **Testing**: Jest + React Testing Library (frontend), Jest + Supertest (backend)

### Game Architecture
The game supports multiple stimulus streams:
- **Dual Mode**: Visual Position + Audio Letter
- **Quad Mode**: Dual + Color Blink + Pitch Tone  
- **Penta Mode**: Quad + Shape

Key components:
- **GameEngine**: Master loop, timing, N-back logic, accuracy checking
- **StimulusScheduler**: Generates pseudo-random sequences (runs in Web Worker)
- **Renderer**: PixiJS-based graphics rendering
- **AudioManager**: Web Audio API management with <30ms latency
- **StatsManager**: Performance tracking and persistence

## Development Guidelines

### Code Style
- Follow TypeScript and ESLint configurations
- Use existing libraries and utilities found in the codebase
- Never inline styles - use Tailwind CSS classes or design tokens
- Mobile-first responsive design

### UI Implementation (from .cursor/rules)
- Use React 18 + Tailwind + shadcn/ui components
- Extract design tokens to `design.json` or `theme.css`
- Meet WCAG AA contrast requirements
- Use Framer Motion for animations (≤300ms duration)
- Test responsive breakpoints: desktop 1280×800, mobile 375×812

### Performance Targets
- **Frame Budget**: ≤16.6ms per frame (60 FPS)
- **Memory**: <200MB desktop, <120MB mobile
- **Audio Latency**: <50ms
- **First Contentful Paint**: <1.2s on fast 3G

### Testing Strategy
- Unit tests (Jest): StimulusScheduler, N-back logic, reducers (≥90% coverage)
- Integration tests (Playwright): Full gameplay on Chrome & Safari
- Visual regression testing for critical components

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/auth/register` | Create user account |
| POST | `/api/v1/auth/login` | Authenticate user |
| POST | `/api/v1/sessions` | Sync completed session |
| GET | `/api/v1/sessions` | Retrieve user sessions |
| GET | `/api/v1/sessions/export/csv` | Download CSV export |

## Data Models

Core interfaces:
- `Trial`: Individual stimulus presentation and user response
- `Session`: Complete game session with trials and settings
- `Settings`: User preferences (theme, volume, accessibility)

Sessions are persisted via IndexedDB (Dexie.js) locally, with optional cloud sync.

## Key Features

### Offline-First
- Complete game logic runs in frontend
- Local storage primary, cloud sync optional
- Service worker for offline capability

### Adaptive Difficulty
- ≥80% accuracy → level up
- <60% accuracy → level down
- Real-time performance calculation

### Accessibility
- Keyboard-only controls (V/A/C/P/S keys)
- ARIA labels and semantic HTML
- Colorblind-friendly 8-color palette
- High contrast mode support
- Screen reader compatibility

## Environment Setup

1. Node.js 22+ LTS required
2. Backend environment: `cp packages/backend/.env.example packages/backend/.env`
3. Database initialization: `npm run db:generate && npm run db:push`

## Troubleshooting

- If packages directory appears empty, the monorepo structure may not be fully implemented yet
- Check individual package.json files for package-specific commands
- Ensure Web Audio API permissions for audio features
- Use `npm run db:studio` to inspect database schema and data