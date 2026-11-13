import {BaseEntity} from '../../../shared/domain/model/base-entity';

/** A GPS device the platform loans to a truck while its IoT plan is active. */
export interface IotDevice extends BaseEntity {
  id: number;
  serialNumber: string;
  status: string;
  vehicleId: string | null;
  vehiclePlate: string | null;
  loanedAt: string | null;
}
