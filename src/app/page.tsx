'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Immediate redirect to test page - this is now the main experience
    router.replace('/test')
  }, [router])

  // Return null to prevent any flash of content
  return null
}
