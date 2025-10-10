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
      <body className="bg-bg-primary text-text-primary min-h-screen">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  )
}
