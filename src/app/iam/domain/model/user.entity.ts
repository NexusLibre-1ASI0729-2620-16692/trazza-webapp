import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {UserRole} from './user-role.value-object';

export interface MerchantProfile {
  id: string;
  businessName: string;
  ruc: string;
  businessType: string;
}

/** The signed in account. Personal data arrives masked (DNI) or decrypted only for its owner. */
export class User implements BaseEntity {
  id: string;
  email: string;
  roles: UserRole[];
  fullName: string;
  dniMasked: string;
  phone: string | null;
  kycStatus: string | null;
  carrierProfileId: string | null;
  merchantProfile: MerchantProfile | null;
  createdAt: string | null;

  constructor(props: {
    id: string; email: string; roles?: UserRole[]; fullName?: string; dniMasked?: string; phone?: string | null;
    kycStatus?: string | null; carrierProfileId?: string | null; merchantProfile?: MerchantProfile | null; createdAt?: string | null;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.roles = [...(props.roles ?? [])];
    this.fullName = props.fullName ?? '';
    this.dniMasked = props.dniMasked ?? '';
    this.phone = props.phone ?? null;
    this.kycStatus = props.kycStatus ?? null;
    this.carrierProfileId = props.carrierProfileId ?? null;
    this.merchantProfile = props.merchantProfile ?? null;
    this.createdAt = props.createdAt ?? null;
  }

  hasRole(role: string | null | undefined): boolean {
    return this.roles.includes(role as UserRole);
  }

  get isCarrier(): boolean {
    return this.hasRole(UserRole.CARRIER);
  }

  get isMerchant(): boolean {
    return this.hasRole(UserRole.MERCHANT);
  }

  get hasBothRoles(): boolean {
    return this.isCarrier && this.isMerchant;
  }

  get isIdentityValidated(): boolean {
    return this.kycStatus === 'VALIDATED';
  }
}
