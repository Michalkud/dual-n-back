# Dual N-Back Cognitive Training Application

A modern web-based implementation of the Dual N-Back cognitive training exercise, built with React and Node.js.

## 🧠 About

The Dual N-Back task is a scientifically proven method for improving working memory and fluid intelligence. This application supports three difficulty levels:

- **Dual Mode**: Visual position + Audio letter streams
- **Quad Mode**: Dual + Color blink + Pitch tone streams  
- **Penta Mode**: Quad + Shape stream (5 total streams)

## 🚀 Features

- **Progressive Difficulty**: Adaptive n-level based on performance
- **Real-time Feedback**: Live accuracy tracking and performance metrics
- **Progress Analytics**: Interactive charts and CSV data export
- **Accessibility**: WCAG 2.2 AA compliant with keyboard navigation
- **Mobile Optimized**: Touch controls with haptic feedback
- **Guest Play**: No registration required for immediate use

## 🛠 Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Zustand** - Lightweight state management
- **Chart.js** - Interactive progress visualization
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js 22 LTS** - JavaScript runtime
- **Express 5** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **PostgreSQL 16** - Relational database
- **Prisma 5** - Modern database toolkit
- **Winston** - Logging library
- **TypeScript** - Type-safe development

### Development
- **pnpm** - Fast package manager
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Jest** - Unit testing
- **Playwright** - End-to-end testing

## 📦 Project Structure

```
dual-n-back/
├── apps/
│   ├── web/                 # React frontend application
│   └── api/                 # Node.js backend API
├── packages/
│   └── shared/              # Shared types and utilities
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.yml       # Development environment
└── README.md
```

## 🏃‍♂️ Quick Start

### Prerequisites

- **Node.js** 22+ 
- **pnpm** 9+
- **Docker** & **Docker Compose** (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Michalkud/dual-n-back.git
   cd dual-n-back
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/api/.env.example apps/api/.env
   # Edit the .env file with your configuration
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

   This starts:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Using Docker (Alternative)

```bash
# Start all services
docker-compose up

# Development with hot-reload
docker-compose -f docker-compose.dev.yml up
```

## 🎮 How to Play

1. **Choose your mode**: Start with Dual mode if you're new
2. **Set your level**: Begin at n=2 (recommended for beginners)
3. **Watch and listen**: Pay attention to the visual grid and audio letters
4. **Respond to matches**: Press corresponding keys when current stimulus matches the one from n-trials back
5. **Track progress**: View your improvement in the Progress section

### Controls

**Desktop**: 
- `A` `S` `D` `K` `L` keys for the 5 streams
- `Space` to pause
- `Esc` to quit

**Mobile**: 
- Touch buttons with haptic feedback
- Swipe gestures for navigation

## 📊 Performance Metrics

The application tracks detailed metrics including:

- **Accuracy per stream** (hit rate, false alarm rate)
- **Reaction times** (mean, median, distribution)
- **n-level progression** over time
- **Session duration** and trial counts

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start both frontend and backend
pnpm dev:web      # Frontend only
pnpm dev:api      # Backend only

# Building
pnpm build        # Build all packages
pnpm build:web    # Build frontend
pnpm build:api    # Build backend

# Testing
pnpm test         # Run all tests
pnpm test:e2e     # End-to-end tests
pnpm test:watch   # Watch mode

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio

# Quality
pnpm lint         # Lint all packages
pnpm type-check   # TypeScript checking
```

### Environment Variables

Create `apps/api/.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dualnback"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 🧪 Testing

### Unit Tests
```bash
pnpm test                    # All unit tests
pnpm --filter web test       # Frontend tests
pnpm --filter api test       # Backend tests
```

### End-to-End Tests
```bash
pnpm test:e2e               # Run e2e tests
pnpm test:e2e:ui            # Interactive mode
```

### Load Testing
```bash
# Using k6 (install separately)
k6 run tests/load/game-session.js
```

## 🚀 Deployment

### Production Build
```bash
pnpm build
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Set up SSL certificates
- Configure logging and monitoring

## 📈 Performance Targets

- **Initial Load**: ≤ 1.5s on 4G connection
- **Frame Rate**: 60 FPS during gameplay
- **Memory Usage**: ≤ 200 MB server RSS
- **API Response**: ≤ 150ms (95th percentile)

## 🔒 Security

- **HTTPS** enforced with HSTS
- **CSP** headers for XSS protection
- **Rate limiting** on all endpoints
- **Argon2** password hashing
- **JWT** with secure refresh tokens
- **CORS** properly configured

## 🌐 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+
- **Mobile Safari** 14+
- **Chrome Mobile** 90+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Michalkud/dual-n-back/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Michalkud/dual-n-back/discussions)

## 🙏 Acknowledgments

- Original dual n-back research by Susanne Jaeggi et al.
- Inspired by existing implementations in the cognitive training community
- Built with amazing open-source technologies

---

**Made with ❤️ for cognitive training enthusiasts**
