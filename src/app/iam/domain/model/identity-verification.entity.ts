import {BaseEntity} from '../../../shared/domain/model/base-entity';

export interface IdentityVerification extends BaseEntity {
  id: number;
  provider: string;
  status: string;
  externalReference: string | null;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}
