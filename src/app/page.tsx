export default function HomePage() {
  return (
    <div className="test-container flex flex-col items-center justify-center min-h-screen">
      <div className="max-w-4xl mx-auto text-center px-8">
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold mb-6 text-accent animate-pulse">
            🐒
          </h1>
          <h2 className="text-6xl md:text-7xl font-bold mb-4 text-text-primary">
            MonkeyMac
          </h2>
        </div>
        
        <p className="text-3xl md:text-4xl text-text-secondary mb-8 font-light">
          is coming soon...
        </p>
        
        <div className="mb-12">
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Mental math training meets MonkeyType&apos;s sleek design. 
            Get ready to supercharge your arithmetic skills with style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 opacity-60">
          <div className="stats-card">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-text-secondary text-sm">Speed-based arithmetic challenges</p>
          </div>
          <div className="stats-card">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-text-secondary text-sm">Detailed statistics and analytics</p>
          </div>
          <div className="stats-card">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Compete</h3>
            <p className="text-text-secondary text-sm">Leaderboards and achievements</p>
          </div>
        </div>

        <div className="mt-16 text-text-secondary">
          <p className="text-sm">
            Built with Next.js • Styled with ❤️ • Powered by Math
          </p>
        </div>
      </div>
    </div>
  )
}
