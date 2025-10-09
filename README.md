# MonkeyMac 🐒🧮

A modern mental math training application inspired by MonkeyType's sleek design and Zetamac's mathematical focus. Practice arithmetic with style and track your progress over time.

## Features

- **Speed Math Tests**: Practice addition, subtraction, multiplication, and division
- **User Authentication**: Register and login to track your progress
- **Statistics Tracking**: Monitor your improvement with detailed stats
- **MonkeyType-inspired UI**: Clean, modern dark theme interface
- **Real-time Testing**: 60-second timed tests with immediate feedback
- **Progress Analytics**: Track accuracy, speed, and improvement trends

## Tech Stack

- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom MonkeyType-inspired theme
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt password hashing
- **Deployment**: Vercel-ready configuration

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or cloud)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd monkeymax
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/monkeymax
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
monkeymax/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── auth/          # Authentication endpoints
│   │   ├── test/              # Math test page
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   └── components/            # Reusable React components
├── .github/                   # GitHub configuration
├── public/                    # Static assets
└── package.json              # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login

### Test Results (Coming Soon)
- `POST /api/results` - Save test results
- `GET /api/results` - Get user's test history
- `GET /api/stats` - Get user statistics

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  createdAt: Date,
  stats: {
    totalTests: Number,
    bestScore: Number,
    averageScore: Number,
    totalProblems: Number,
    accuracy: Number
  }
}
```

### Test Results Collection (Coming Soon)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  score: Number,
  totalProblems: Number,
  correctAnswers: Number,
  timeLimit: Number,
  testDate: Date,
  problemTypes: [String]
}
```

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

### Environment Variables for Production

Set these in your Vercel dashboard:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secure random string for JWT signing

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## Features Coming Soon

- [ ] Dashboard with detailed statistics
- [ ] Leaderboards and rankings  
- [ ] Different test modes (custom time limits, specific operations)
- [ ] Achievement system
- [ ] Test history and analytics
- [ ] Social features (friend comparisons)
- [ ] Mobile responsive design improvements
- [ ] Keyboard shortcuts for power users

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [MonkeyType](https://monkeytype.com) for the clean UI design
- Inspired by [Zetamac](https://arithmetic.zetamac.com) for the math testing concept
