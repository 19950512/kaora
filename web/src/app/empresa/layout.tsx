import { ReactNode } from 'react'

interface EmpresaLayoutProps {
  children: ReactNode
}

export default function EmpresaLayout({ children }: EmpresaLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
