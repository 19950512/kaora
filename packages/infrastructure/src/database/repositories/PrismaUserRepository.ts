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
        // Deixar que o banco defina createdAt e updatedAt automaticamente
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

  async findByEmailWithBusiness(email: string): Promise<{ user: User; business: any } | null> {
    const data = await this.prisma.user.findFirst({
      where: { email },
      include: {
        business: true
      }
    });

    if (!data) return null;

    const user = new User({
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

    return {
      user,
      business: data.business
    };
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id.toString() },
      data: {
        name: user.name.toString(),
        email: user.email.toString(),
        document: user.document.toString(),
        phone: user.phone.toString(),
        active: user.active,
      }
    });
  }

  async findAll(): Promise<User[]> {
    const data = await this.prisma.user.findMany();

    const users: User[] = [];
    for (const d of data) {
      try {
        users.push(new User({
          id: d.id,
          businessId: d.businessId,
          name: d.name,
          email: d.email,
          passwordHash: d.passwordHash,
          document: d.document,
          phone: d.phone,
          active: d.active,
          createdAt: d.createdAt?.toISOString(),
          updatedAt: d.updatedAt?.toISOString(),
        }));
      } catch (err) {
        // Pular registros inválidos para não quebrar listagem
        // eslint-disable-next-line no-console
        console.warn('[PrismaUserRepository.findAll] Ignorando usuário inválido:', d?.id, err);
      }
    }
    return users;
  }
}
