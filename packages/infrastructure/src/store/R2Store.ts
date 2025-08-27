import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Store, ENV } from '@kaora/domain';

export class R2Store implements Store {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    
    if (!ENV.R2_ACCOUNT_ID || !ENV.R2_ACCESS_KEY_ID || !ENV.R2_SECRET_ACCESS_KEY) {
      // Não lançar erro, permitir que o serviço seja criado mas marcar como não configurado
      this.bucketName = 'demo-bucket';
      this.publicUrl = 'https://demo.kaora.app';
      // Criar cliente S3 dummy que falhará graciosamente
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: 'https://demo.r2.cloudflarestorage.com',
        credentials: {
          accessKeyId: 'demo',
          secretAccessKey: 'demo',
        },
        forcePathStyle: true,
      });
      return;
    }

    this.bucketName = ENV.R2_BUCKET_NAME;
    this.publicUrl = ENV.R2_PUBLIC_URL;

    // Configure S3 client for Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${ENV.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ENV.R2_ACCESS_KEY_ID,
        secretAccessKey: ENV.R2_SECRET_ACCESS_KEY,
      },
      // Force path style for R2 compatibility
      forcePathStyle: true,
    });
  }

  async upload(key: string, data: Buffer | Uint8Array | string, contentType?: string): Promise<string> {
    try {
      
      const body = typeof data === 'string' ? Buffer.from(data) : data;
      
      // Use provided content type or determine from file extension
      const finalContentType = contentType || this.getContentType(key);
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: finalContentType,
        // R2 não suporta ACL - remover para evitar AccessDenied
        // ACL: finalContentType.startsWith('image/') ? 'public-read' : undefined,
      });

      await this.s3Client.send(command);
      
      // Return the public URL if available, otherwise return the key
      if (this.publicUrl) {
        return `${this.publicUrl}/${key}`;
      }
      
      return `https://${this.bucketName}.${ENV.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
    } catch (error: any) {
            
      // Verificar se é erro de credenciais ou configuração
      if (error.message?.includes('Access Denied') || 
          error.Code === 'AccessDenied' ||
          error.message?.includes('SignatureDoesNotMatch') ||
          error.message?.includes('InvalidAccessKeyId') ||
          error.message?.includes('demo')) {
        throw new Error('R2 configuration missing or invalid. Using demo mode.');
      }
      
      throw new Error(`Failed to upload file: ${error.message || 'Unknown error'}`);
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('No data received from R2');
      }

      // Convert the readable stream to buffer
      const chunks: Uint8Array[] = [];
      const reader = response.Body.transformToWebStream().getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('❌ Error downloading from R2:', error);
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('❌ Error deleting from R2:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      // If the error is 404 (Not Found), the object doesn't exist
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      
      console.error('❌ Error checking if file exists in R2:', error);
      throw new Error(`Failed to check file existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getContentType(key: string): string {
    const extension = key.split('.').pop()?.toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      txt: 'text/plain',
      json: 'application/json',
      xml: 'application/xml',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Generate a unique key for file uploads
   */
  static generateKey(businessId: string, filename: string, type: 'logo' | 'document' = 'logo'): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = filename.split('.').pop();
    
    return `businesses/${businessId}/${type}/${timestamp}-${randomId}.${extension}`;
  }

  /**
   * Validate file for logo upload
   */
  static validateLogoFile(file: { name: string; size: number; type: string }): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande. Tamanho máximo: 5MB' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de arquivo não suportado. Use JPG, PNG, WebP ou SVG' };
    }
    
    return { valid: true };
  }
}
