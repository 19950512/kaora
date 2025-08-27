'use client'

import { useState, useRef } from 'react'
import { Upload, X, Check, AlertCircle, Camera } from 'lucide-react'

interface LogoUploadProps {
  businessId: string
  currentLogoUrl?: string
  onLogoUpdated?: (newLogoUrl: string) => void
}

export function LogoUpload({ businessId, currentLogoUrl, onLogoUpdated }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | false>(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou SVG.')
      return
    }

    // Validar tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Máximo 5MB.')
      return
    }

    // Criar preview
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    // Upload do arquivo
    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      setError(null)
      setSuccess(false)

      const formData = new FormData()
      formData.append('logo', file)
      formData.append('businessId', businessId)

      const response = await fetch('/api/business/upload-logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao fazer upload')
      }

      const data = await response.json()
      
      setSuccess(data.message || 'Logo enviada com sucesso!')
      setPreviewUrl(data.logoUrl)
      
      // Notificar componente pai
      if (onLogoUpdated) {
        onLogoUpdated(data.logoUrl)
      }

      // Limpar mensagem de sucesso após alguns segundos
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      console.error('Erro no upload:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      
      // Reverter preview em caso de erro
      setPreviewUrl(currentLogoUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const removeLogo = () => {
    setPreviewUrl(null)
    setError(null)
    setSuccess(false)
    // TODO: Implementar remoção no backend
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        {/* Preview da Logo */}
        <div className="relative inline-block">
          <div 
            className="w-32 h-32 rounded-lg border-2 border-dashed border-border bg-muted/50 flex items-center justify-center overflow-hidden hover:bg-muted/70 transition-colors cursor-pointer"
            onClick={handleButtonClick}
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Logo da empresa"
                  className="w-full h-full object-contain"
                />
                {/* Botão de remover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeLogo()
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-sm border border-destructive/20"
                  title="Remover logo"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <div className="text-center p-4">
                <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-medium">Logo da Empresa</p>
                <p className="text-xs text-muted-foreground mt-1">Clique para enviar</p>
              </div>
            )}
          </div>

          {/* Indicador de upload */}
          {uploading && (
            <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {/* Botão de upload */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={uploading}
            className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Enviando...' : previewUrl ? 'Alterar Logo' : 'Enviar Logo'}
          </button>
        </div>

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Mensagens de status */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-800 dark:text-emerald-300">{success}</p>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Formatos aceitos: JPEG, PNG, WebP, SVG<br />
          Tamanho máximo: 5MB
        </p>
      </div>
    </div>
  )
}
