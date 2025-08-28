import { useState, useEffect } from 'react'

export function useAuditContexts() {
  const [contexts, setContexts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContexts = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auditoria/contexts')

      if (!response.ok) {
        throw new Error('Failed to fetch audit contexts')
      }

      const result = await response.json()
      setContexts(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContexts()
  }, [])

  return {
    contexts,
    loading,
    error,
    refetch: fetchContexts
  }
}
