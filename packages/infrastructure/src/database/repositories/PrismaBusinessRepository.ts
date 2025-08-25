import { BusinessRepository } from '@kaora/domain';
import { Business } from '@kaora/domain';

export class PrismaBusinessRepository implements BusinessRepository {
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
        createdAt: new Date(business.createdAt.toString()),
        updatedAt: business.updatedAt ? new Date(business.updatedAt.toString()) : null,
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
        updatedAt: new Date(),
      }
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
