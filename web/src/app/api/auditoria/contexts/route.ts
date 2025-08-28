'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuditService } from '@kaora/application'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { getContainer, TOKENS } = await import('@kaora/application');
    const container = getContainer();

    const auditService = container.get<AuditService>(TOKENS.AUDIT_SERVICE);

    const contexts = await auditService.getContexts()

    return NextResponse.json({
      data: contexts
    })

  } catch (error) {
    console.error('Error fetching audit contexts:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
