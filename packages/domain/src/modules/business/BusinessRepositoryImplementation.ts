import { Business } from './Business';
import { BusinessRepository } from './BusinessRepository';

// Prisma Client será inicializado via injeção de dependência
let prisma: any = null;

// Método para injetar o Prisma Client
export function setPrismaClient(client: any) {
  prisma = client;
}

export class BusinessRepositoryImplementation implements BusinessRepository {
  async existsByEmail(email: string): Promise<boolean> {
    const business = await prisma.business.findUnique({ where: { email } });
    return business !== null;
  }

  async update(business: Business): Promise<void> {
    await prisma.business.update({
      where: { id: business.id.toString() },
      data: {
        name: business.name.toString(),
        email: business.email.toString(),
        document: business.document.toString(),
        phone: business.phone.toString(),
        whatsapp: business.whatsapp.toString(),
        createdAt: business.createdAt,
        updatedAt: new Date(),
      },
    });
  }

  async save(business: Business): Promise<void> {
    if (!prisma) throw new Error('PrismaClient não está disponível.');
    await prisma.business.create({
      data: {
        id: business.id.toString(),
        name: business.name.toString(),
        email: business.email.toString(),
        document: business.document.toString(),
        phone: business.phone.toString(),
        whatsapp: business.whatsapp.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findById(id: string): Promise<Business | null> {
    if (!prisma) throw new Error('PrismaClient não está disponível.');
    const result = await prisma.business.findUnique({ where: { id } });
    if (!result) return null;
    return new Business({
      id: result.id,
      name: result.name,
      email: result.email,
      document: result.document,
      phone: result.phone,
      whatsapp: result.whatsapp,
      createdAt: result.createdAt?.toISOString(),
      updatedAt: result.updatedAt?.toISOString(),
    });
  }
}
