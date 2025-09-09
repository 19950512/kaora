import { RoleRepository } from './RoleRepository';
import { Role } from './Role';

let prisma: any;

export function setPrismaClient(prismaClient: any) {
  prisma = prismaClient;
}

export class RoleRepositoryImplementation implements RoleRepository {
  async save(role: Role): Promise<void> {
    await prisma.role.create({
      data: {
        id: role.id.toString(),
        businessId: role.businessId.toString(),
        name: role.name.toString(),
        active: role.active,
        color: role.color,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findById(id: string, businessId: string): Promise<Role | null> {
    const role = await prisma.role.findFirst({
      where: { 
        id,
        businessId,
      },
    });

    if (!role) return null;

    return new Role({
      id: role.id,
      businessId: role.businessId,
      name: role.name,
      active: role.active,
      color: role.color,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  }

  async findAllByBusinessId(businessId: string): Promise<Role[]> {
    const roles = await prisma.role.findMany({
      where: {
        businessId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return roles.map((role: any) => new Role({
      id: role.id,
      businessId: role.businessId,
      name: role.name,
      active: role.active,
      color: role.color,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));
  }

  async existsByNameAndBusinessId(name: string, businessId: string, excludeId?: string): Promise<boolean> {
    const role = await prisma.role.findFirst({
      where: {
        name,
        businessId,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });

    return !!role;
  }

  async update(role: Role): Promise<void> {
    await prisma.role.update({
      where: { 
        id: role.id.toString(),
      },
      data: {
        name: role.name.toString(),
        active: role.active,
        color: role.color,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string, businessId: string): Promise<void> {
    await prisma.role.delete({
      where: { 
        id,
        businessId,
      },
    });
  }
}
