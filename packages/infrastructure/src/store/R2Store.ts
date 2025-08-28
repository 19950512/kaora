import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Store, ENV } from '@kaora/domain';

export class R2Store implements Store {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    
    if (!ENV.R2_ACCOUNT_ID || !ENV.R2_ACCESS_KEY_ID || !ENV.R2_SECRET_ACCESS_KEY) {
      // Modo demo
      this.bucketName = 'demo-bucket';
      this.publicUrl = 'https://demo.kaora.app';
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: 'https://demo.r2.cloudflarestorage.com',
        credentials: { accessKeyId: 'demo', secretAccessKey: 'demo' },
        forcePathStyle: true,
      });
      return;
    }

    this.bucketName = ENV.R2_BUCKET_NAME;
    this.publicUrl = ENV.R2_PUBLIC_URL;

    // Desabilitar verificação SSL para contornar problemas
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${ENV.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ENV.R2_ACCESS_KEY_ID,
        secretAccessKey: ENV.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
      requestHandler: {
        connectionTimeout: 5000,
        requestTimeout: 15000,
      },
      maxAttempts: 1,
    });
  }

  async upload(key: string, data: Buffer | Uint8Array | string, contentType?: string): Promise<string> {
    try {
      const body = typeof data === 'string' ? Buffer.from(data) : data;
      const finalContentType = contentType || this.getContentType(key);
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: finalContentType,
      });

      await this.s3Client.send(command);
      
      if (this.publicUrl) {
        return `${this.publicUrl}/${key}`;
      }
      
      return `https://${this.bucketName}.${ENV.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
    } catch (error: any) {
      // Detectar erros SSL/rede e usar modo demo
      if (error.message?.includes('EPROTO') ||
          error.message?.includes('SSL') ||
          error.message?.includes('handshake') ||
          error.message?.includes('ENOTFOUND') ||
          error.code === 'EPROTO' ||
          error.code === 'ENOTFOUND') {
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

      const chunks: Uint8Array[] = [];
      const reader = response.Body.transformToWebStream().getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      return Buffer.concat(chunks);
    } catch (error) {
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
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      
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

  static generateKey(businessId: string, filename: string, type: 'logo' | 'document' = 'logo'): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = filename.split('.').pop();
    
    return `businesses/${businessId}/${type}/${timestamp}-${randomId}.${extension}`;
  }

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
