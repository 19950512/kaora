import { RoleRepository } from '@kaora/domain';

export class GetRoles {
  constructor(
    private readonly roleRepository: RoleRepository
  ) {}

  async execute(businessId: string): Promise<any[]> {
    const roles = await this.roleRepository.findAllByBusinessId(businessId);
    return roles.map(role => role.toObject());
  }
}
