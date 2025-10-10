import type { Metadata } from 'next'
import './globals.css'
import ClientLayoutWrapper from '../components/ClientLayoutWrapper'

export const metadata: Metadata = {
  title: 'MonkeyMac - Mental Math Training',
  description: 'Practice mental math with style - inspired by MonkeyType',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Righteous&family=Fredoka+One&family=Kalam:wght@300;400;700&family=Caveat:wght@400;500;600;700&family=Dancing+Script:wght@400;500;600;700&family=Pacifico&family=Satisfy&family=Architects+Daughter&family=Indie+Flower&family=Bangers&family=Bungee&family=Creepster&family=Fascinate&family=Griffy&family=Jolly+Lodger&family=Kaushan+Script&family=Lobster&family=Monoton&family=Nosifer&family=Orbitron:wght@400;500;600;700;800;900&family=Press+Start+2P&family=Russo+One&family=Stardos+Stencil:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-bg-primary text-text-primary min-h-screen">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  )
}
