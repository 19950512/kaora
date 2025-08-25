import { User } from './User';
import { UserRepository } from './UserRepository';

// Prisma Client será inicializado via injeção de dependência
let prisma: any = null;

// Método para injetar o Prisma Client
export function setPrismaClient(client: any) {
  prisma = client;
}

export class UserRepositoryImplementation implements UserRepository {
  async existsByEmailAndBusinessId(email: string, businessId: string): Promise<boolean> {
    const user = await prisma.user.findFirst({ where: { email, businessId } });
    return user !== null;
  }
  
  async save(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id.toString(),
        businessId: user.businessId.toString(),
        name: user.name.toString(),
        email: user.email.toString(),
        passwordHash: user.passwordHash,
        document: user.document.toString(),
        phone: user.phone.toString(),
        active: user.active,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const result = await prisma.user.findUnique({ where: { id } });
    if (!result) return null;
    return new User({
      id: result.id,
      businessId: result.businessId,
      name: result.name,
      email: result.email,
      passwordHash: result.passwordHash,
      document: result.document,
      phone: result.phone,
      active: result.active,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

}
