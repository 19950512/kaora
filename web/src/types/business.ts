export interface Business {
  id: string;
  name: string;
  email: string;
  document: string;
  phone: string;
  whatsapp: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessApiResponse {
  id: string;
  name: string;
  email: string;
  document: string;
  phone: string;
  whatsapp: string;
  createdAt: string;
  updatedAt: string;
}
