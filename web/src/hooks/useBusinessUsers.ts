import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
}

export function useBusinessUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/business/users')

      if (!response.ok) {
        throw new Error('Failed to fetch business users')
      }

      const result = await response.json()
      setUsers(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  }
}
