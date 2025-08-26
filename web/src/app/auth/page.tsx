'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona automaticamente para /auth/login
    router.replace('/auth/login')
  }, [router])

  // Retorna null enquanto o redirecionamento acontece
  return null
}
