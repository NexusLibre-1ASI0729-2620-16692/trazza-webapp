import {User} from '../domain/model/user.entity';
import {isUserRole} from '../domain/model/user-role.value-object';
import {AccountResource} from './iam-resources';

export class UserAssembler {
  static toEntityFromResource(resource: AccountResource): User {
    return new User({
      id: resource.id,
      email: resource.email,
      roles: (resource.roles ?? []).filter(isUserRole),
      fullName: resource.identity?.fullName ?? '',
      dniMasked: resource.identity?.dniMasked ?? '',
      phone: resource.identity?.phone ?? null,
      kycStatus: resource.identity?.kycStatus ?? null,
      carrierProfileId: resource.carrierProfile?.id ?? null,
      merchantProfile: resource.merchantProfile ?? null,
      createdAt: resource.createdAt
    });
  }
}
