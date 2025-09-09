import { RoleRepository } from '@kaora/domain';

export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: any) {}

  async save(role: any): Promise<void> {
    await this.prisma.role.create({
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

  async findById(id: string, businessId: string): Promise<any | null> {
    const role = await this.prisma.role.findFirst({
      where: { 
        id,
        businessId,
      },
    });

    if (!role) return null;

    const { Role } = require('@kaora/domain');
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

  async findAllByBusinessId(businessId: string): Promise<any[]> {
    const roles = await this.prisma.role.findMany({
      where: {
        businessId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const { Role } = require('@kaora/domain');
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
    const role = await this.prisma.role.findFirst({
      where: {
        name,
        businessId,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });

    return !!role;
  }

  async update(role: any): Promise<void> {
    await this.prisma.role.update({
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
    await this.prisma.role.delete({
      where: { 
        id,
        businessId,
      },
    });
  }
}
