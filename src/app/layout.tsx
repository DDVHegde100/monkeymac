import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
