'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface UserBusinessInfo {
  hasCompany: boolean
  companyId: string | null
  companyName: string | null
}

export function useUserBusiness() {
  const { data: session } = useSession()
  const [businessInfo, setBusinessInfo] = useState<UserBusinessInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false)
      return
    }

    const fetchUserBusiness = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/business/check-user-business?email=${encodeURIComponent(session.user?.email || '')}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao verificar empresa do usuário')
        }

        const data = await response.json()
        setBusinessInfo(data)
      } catch (err) {
        console.error('Erro ao buscar empresa do usuário:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchUserBusiness()
  }, [session?.user?.email])

  return {
    businessInfo,
    loading,
    error,
    hasCompany: businessInfo?.hasCompany || false,
    companyId: businessInfo?.companyId,
    companyName: businessInfo?.companyName
  }
}
