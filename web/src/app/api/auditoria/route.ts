'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuditService } from '@kaora/application'
import { DatabaseProvider } from '@kaora/infrastructure'

const prisma = DatabaseProvider.getInstance()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { getContainer, TOKENS } = await import('@kaora/application');
    const container = getContainer();

    const auditService = container.get<AuditService>(TOKENS.AUDIT_SERVICE);

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const context = searchParams.get('context')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const businessId = session.user.businessId

    const filters = {
      context: context || undefined,
      userId: userId || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset: (page - 1) * limit
    }

    const result = await auditService.getAuditLogs(businessId, filters)

    // Get user information for the audit logs
    const userIds = [...new Set(result.logs.map(log => log.userId))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    })

    const userMap = users.reduce((acc: Record<string, any>, user: any) => {
      acc[user.id] = user
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      data: result.logs.map(log => ({
        id: log.id.toString(),
        context: log.context,
        userId: log.userId,
        businessId: log.businessId,
        timestamp: log.timestamp.value,
        details: log.details,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        additionalData: log.additionalData,
        updatedFields: log.updatedFields,
        user: userMap[log.userId] || null
      })),
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
