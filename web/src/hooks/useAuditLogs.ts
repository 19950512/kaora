import { useState, useEffect } from 'react'

interface AuditLog {
  id: string
  context: string
  timestamp: string
  details?: string
  ipAddress?: string
  userAgent?: string
  additionalData?: any
  updatedFields?: string
  user?: {
    id: string
    name: string
    email: string
  } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface UseAuditLogsOptions {
  page?: number
  limit?: number
  context?: string
  userId?: string
  startDate?: string
  endDate?: string
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const [data, setData] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAuditLogs = async (opts: UseAuditLogsOptions = {}) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      if (opts.page) params.append('page', opts.page.toString())
      if (opts.limit) params.append('limit', opts.limit.toString())
      if (opts.context) params.append('context', opts.context)
      if (opts.userId) params.append('userId', opts.userId)
      if (opts.startDate) params.append('startDate', opts.startDate)
      if (opts.endDate) params.append('endDate', opts.endDate)

      const response = await fetch(`/api/auditoria?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }

      const result = await response.json()
      setData(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs(options)
  }, [options.page, options.limit, options.context, options.userId, options.startDate, options.endDate])

  return {
    data,
    pagination,
    loading,
    error,
    refetch: fetchAuditLogs
  }
}
