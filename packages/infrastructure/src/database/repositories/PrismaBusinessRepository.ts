import { BusinessRepository } from '@kaora/domain';
import { Business } from '@kaora/domain';

export class PrismaBusinessRepository implements BusinessRepository {
  async saveWithUser(business: any, user: any): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.business.create({
        data: {
          id: business.id.toString(),
          name: business.name.toString(),
          email: business.email.toString(),
          document: business.document.toString(),
          phone: business.phone.toString(),
          whatsapp: business.whatsapp.toString(),
          logoUrl: business.logoUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      this.prisma.user.create({
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
  async existsByDocument(document: string): Promise<boolean> {
    const count = await this.prisma.business.count({ where: { document } });
    return count > 0;
  }
  constructor(private prisma: any) {}

  async save(business: Business): Promise<void> {
    await this.prisma.business.create({
      data: {
        id: business.id.toString(),
        name: business.name.toString(),
        email: business.email.toString(),
        document: business.document.toString(),
        phone: business.phone.toString(),
        whatsapp: business.whatsapp.toString(),
        logoUrl: business.logoUrl,
        // Deixar que o banco defina createdAt e updatedAt automaticamente
        // createdAt e updatedAt são definidos pelo schema do Prisma com @default(now()) e @updatedAt
      }
    });
  }

  async update(business: Business): Promise<void> {
    await this.prisma.business.update({
      where: { id: business.id.toString() },
      data: {
        name: business.name.toString(),
        email: business.email.toString(),
        document: business.document.toString(),
        phone: business.phone.toString(),
        whatsapp: business.whatsapp.toString(),
        logoUrl: business.logoUrl,
        updatedAt: new Date(),
      }
    });
  }

  async updateById(id: string, updateData: any): Promise<any> {
    return await this.prisma.business.update({
      where: { id },
      data: updateData
    });
  }

  async findById(id: string): Promise<Business | null> {
    const data = await this.prisma.business.findUnique({
      where: { id }
    });

    if (!data) return null;

    return new Business({
      id: data.id,
      name: data.name,
      email: data.email,
      document: data.document,
      phone: data.phone,
      whatsapp: data.whatsapp,
      logoUrl: data.logoUrl,
      createdAt: data.createdAt?.toISOString(),
      updatedAt: data.updatedAt?.toISOString(),
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.business.count({
      where: { email }
    });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.business.delete({
      where: { id }
    });
  }
}
