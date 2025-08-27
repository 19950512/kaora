export const ENV = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // R2 Storage Configuration
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'kaora',
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || '',
  
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '3000',
}