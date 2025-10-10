'use client'

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center">
      <div className="text-center">
        {/* MonkeyMac Logo */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden bg-accent/10 border-2 border-accent/20">
            <img 
              src="/monk.png" 
              alt="MonkeyMac Logo" 
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                // Fallback to text if image doesn't load
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="w-full h-full bg-accent rounded-2xl items-center justify-center text-bg-primary font-bold text-3xl hidden">
              M
            </div>
          </div>
          <h1 className="text-3xl font-bold text-accent">MonkeyMac</h1>
        </div>
        
        {/* Animated loading indicator */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:150ms]"></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:300ms]"></div>
        </div>
        
        <p className="text-text-secondary">{message}</p>
      </div>
    </div>
  )
}
