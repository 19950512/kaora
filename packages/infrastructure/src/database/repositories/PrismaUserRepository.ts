import { UserRepository } from '@kaora/domain';
import { User } from '@kaora/domain';

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: any) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id.toString(),
        businessId: user.businessId.toString(),
        name: user.name.toString(),
        email: user.email.toString(),
        passwordHash: user.passwordHash,
        document: user.document.toString(),
        phone: user.phone.toString(),
        active: user.active,
        createdAt: new Date(user.createdAt.toString()),
        updatedAt: user.updatedAt ? new Date(user.updatedAt.toString()) : null,
      }
    });
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!data) return null;

    return new User({
      id: data.id,
      businessId: data.businessId,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      document: data.document,
      phone: data.phone,
      active: data.active,
      createdAt: data.createdAt?.toISOString(),
      updatedAt: data.updatedAt?.toISOString(),
    });
  }

  async existsByEmailAndBusinessId(email: string, businessId: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { 
        email,
        businessId 
      }
    });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }
}
