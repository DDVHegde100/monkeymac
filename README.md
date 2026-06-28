# MonkeyMac

![MonkeyMac Banner](public/monk.png)

A comprehensive mental math training application that combines the aesthetic excellence of MonkeyType with the mathematical rigor of Zetamac. Practice timed arithmetic, track your progress across difficulties, customize themes and fonts, compete on leaderboards, unlock achievements, and race friends in real-time multiplayer with ELO-ranked party codes.

**Live Demo**: [monkeymac.vercel.app](https://monkeymac.vercel.app/test)

## Features

- **Zetamac-faithful modes** — Classic (120s, exact Zetamac ranges), Medium, Hard, Abstract, and custom free play
- **Test customization** — Themes, fonts, layout, timer visibility, and a custom theme builder
- **Stats & analytics** — Personal history, operation breakdowns, streaks, and performance insights
- **Leaderboards & achievements** — Solo rankings plus multiplayer ELO and win leaderboards
- **Multiplayer races** — Create or join 6-character party codes (up to 4 players), shared problem seeds, live score sync, ELO updates

## Technical Stack

### Framework & Runtime
- **Next.js 14.2.33** - React-based full-stack framework with App Router
- **React 18** - Component-based UI library with hooks and concurrent features
- **TypeScript** - Static type checking for enhanced development experience
- **Node.js** - JavaScript runtime for server-side operations

### Styling & UI
- **Tailwind CSS 3.4.1** - Utility-first CSS framework for rapid styling
- **Custom CSS Modules** - Component-scoped styling with CSS variables
- **Google Fonts Integration** - 25+ typography options including Fira Code, JetBrains Mono, Roboto Mono
- **Responsive Design** - Mobile-first approach with breakpoint-based layouts

### Database & Authentication
- **MongoDB** - NoSQL document database with aggregation pipeline support
- **bcryptjs** - Password hashing with configurable salt rounds (12 rounds)
- **JWT (jsonwebtoken)** - Stateless authentication with secure token signing
- **Cookie-based Sessions** - HTTP-only cookies for enhanced security

### Deployment & Infrastructure
- **Vercel** - Edge-optimized deployment with automatic CI/CD
- **MongoDB Atlas** - Cloud-hosted database with automatic scaling
- **GitHub Integration** - Version control with automated deployments

## Architecture Overview

### File Structure
```
src/
├── app/                          # Next.js App Router pages
│   ├── api/                      # Server-side API endpoints
│   │   ├── auth/                 # Authentication routes
│   │   ├── party/                # Multiplayer party lobby & race sync
│   │   ├── test/                 # Test result saving
│   │   └── user/                 # User data endpoints
│   ├── multiplayer/page.tsx      # Party lobby and live races
│   ├── leaderboards/page.tsx     # Solo + multiplayer rankings
│   ├── login/page.tsx            # Authentication form
│   ├── register/page.tsx         # User registration
│   ├── search/page.tsx           # User search functionality
│   ├── settings/page.tsx         # Theme and preference management
│   ├── stats/page.tsx            # Personal statistics
│   ├── test/page.tsx             # Core math testing interface
│   ├── globals.css               # Global styles and CSS variables
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Landing page
├── components/                   # Reusable React components
│   ├── ClientLayoutWrapper.tsx   # Client-side layout logic
│   ├── KeyboardShortcuts.tsx     # Global keyboard event handling
│   ├── LoadingScreen.tsx         # Application loading states
│   ├── Navbar.tsx                # Navigation component
│   ├── OnboardingFlow.tsx        # New user setup wizard
│   ├── PerformanceMonitor.tsx    # Real-time performance tracking
│   └── SmartDashboard.tsx        # Intelligent dashboard with insights
└── lib/
    └── mongodb.ts                # Database connection and utilities
```

### Core Components

#### Test Engine (`/test/page.tsx`)
- **Problem Generation**: Dynamic arithmetic problem creation with configurable difficulty
- **Timer System**: Precise countdown with millisecond accuracy
- **Input Validation**: Real-time answer checking with immediate feedback
- **Performance Tracking**: WPM calculation, accuracy measurement, and streak counting
- **Auto-advance Logic**: Seamless problem progression with customizable settings

#### Analytics System (`/analytics/page.tsx`)
- **Performance Metrics**: Comprehensive analysis of speed, accuracy, and improvement trends
- **Difficulty Breakdown**: Per-operation statistics with visual representations
- **Time Pattern Analysis**: Peak performance identification and scheduling recommendations
- **Predictive Insights**: AI-powered suggestions for improvement strategies

#### Authentication Flow
- **Registration**: Phone number collection, password hashing, user profile creation
- **Login**: Credential validation, JWT generation, session management
- **Session Persistence**: Automatic token refresh and secure logout

#### Database Schema

##### Users Collection
```typescript
interface User {
  _id: ObjectId
  firstName: string
  username: string
  phone: string
  password: string // bcrypt hashed
  createdAt: Date
  stats: {
    totalTests: number
    bestScore: number
    averageScore: number
    totalProblems: number
    accuracy: number
    currentStreak: number
    longestStreak: number
    totalTimeSpent: number
    averagePPM: number
    testsRestarted: number
    elo: number
    multiplayerWins: number
    multiplayerLosses: number
    multiplayerGames: number
  }
  preferences?: {
    difficulty: 'easy' | 'medium' | 'hard'
    operations: string[]
    duration: number
    theme: string
    font: string
  }
}
```

##### Test Results Collection
```typescript
interface TestResult {
  _id: ObjectId
  userId: ObjectId
  score: number
  totalProblems: number
  correctAnswers: number
  accuracy: number
  duration: number
  difficulty: string
  operations: string[]
  averageTimePerProblem: number
  problemsPerMinute: number
  testDate: Date
  problems: Array<{
    question: string
    userAnswer: number
    correctAnswer: number
    isCorrect: boolean
    timeSpent: number
    operation: string
  }>
}
```

##### Performance Metrics Collection
```typescript
interface PerformanceMetric {
  _id: ObjectId
  userId: ObjectId
  date: Date
  totalTests: number
  averageScore: number
  bestScore: number
  totalProblems: number
  accuracy: number
  operationBreakdown: {
    [operation: string]: {
      totalProblems: number
      correctAnswers: number
      averageTime: number
      accuracy: number
    }
  }
}
```

## API Architecture

### Authentication Middleware
All protected routes implement JWT validation with automatic token refresh and user session management.

### Error Handling
Comprehensive error handling with standardized response formats and appropriate HTTP status codes.

### Data Validation
Input sanitization and validation using TypeScript interfaces and runtime checks.

### Performance Optimization
- **Database Indexing**: Optimized queries with compound indexes on user operations
- **Caching Strategy**: Session caching and query result optimization
- **Lazy Loading**: Component-level code splitting for faster initial loads

## Development Setup

### Prerequisites
- Node.js 18.17.0 or higher
- MongoDB 6.0+ (local or Atlas)
- Git for version control

### Local Development
```bash
# Clone repository
git clone https://github.com/DDVHegde100/monkeymac.git
cd monkeymac

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and JWT secret

# Start development server
npm run dev
```

### Environment Configuration
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/monkeymax
JWT_SECRET=your-256-bit-secret-key
```

See `.env.example` for a full template and Vercel deploy checklist.

### Build and Deployment
```bash
# Production build
npm run build

# Deploy to Vercel
vercel --prod
```

## Performance Metrics

The application implements comprehensive performance tracking including:
- **Response Time Monitoring**: API endpoint latency measurement
- **Database Query Optimization**: Aggregation pipeline efficiency
- **Client-Side Performance**: Component render time and memory usage
- **User Experience Metrics**: Test completion rates and engagement analytics

## Contributing

This project follows standard Git workflow practices. Please ensure all commits include appropriate TypeScript types and comprehensive error handling. Feature requests and bug reports are welcome through GitHub Issues.

## License

MIT License - see LICENSE file for details.
