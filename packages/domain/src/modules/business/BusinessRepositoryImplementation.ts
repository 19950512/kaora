import { Business } from './Business';
import { BusinessRepository } from './BusinessRepository';

// Prisma Client será inicializado via injeção de dependência
let prisma: any = null;

// Método para injetar o Prisma Client
export function setPrismaClient(client: any) {
  prisma = client;
}

export class BusinessRepositoryImplementation implements BusinessRepository {
  async save(business: Business): Promise<void> {
    if (!prisma) throw new Error('PrismaClient não está disponível.');
    try {
      await prisma.business.create({
        data: {
          id: business.id.toString(),
          name: business.name.toString(),
          email: business.email.toString(),
          document: business.document.toString(),
          phone: business.phone.toString(),
          whatsapp: business.whatsapp.toString(),
          logoUrl: business.logoUrl || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (err: any) {
      const isDuplicateDocument = (
        (err.code === 'P2002' && err.meta?.target?.includes('document')) ||
        (typeof err.message === 'string' && err.message.includes('Unique constraint failed') && err.message.includes('document'))
      );
      if (isDuplicateDocument) {
        throw new Error('Já existe uma empresa cadastrada com este documento.');
      }
      throw err;
    }
  }
  async existsByEmail(email: string): Promise<boolean> {
    const business = await prisma.business.findUnique({ where: { email } });
    return business !== null;
  }

  async existsByDocument(document: string): Promise<boolean> {
    const business = await prisma.business.findUnique({ where: { document } });
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
        logoUrl: business.logoUrl || null,
        createdAt: business.createdAt,
        updatedAt: new Date(),
      },
    });
  }

  async saveWithUser(business: Business, user: any): Promise<void> {
    if (!prisma) throw new Error('PrismaClient não está disponível.');
    await prisma.$transaction([
      prisma.business.create({
        data: {
          id: business.id.toString(),
          name: business.name.toString(),
          email: business.email.toString(),
          document: business.document.toString(),
          phone: business.phone.toString(),
          whatsapp: business.whatsapp.toString(),
          logoUrl: business.logoUrl || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          id: user.id.toString(),
          businessId: business.id.toString(),
          name: user.name.toString(),
          email: user.email.toString(),
          passwordHash: user.passwordHash,
          document: user.document.toString(),
          phone: user.phone.toString(),
          active: user.active,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    ]);
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
