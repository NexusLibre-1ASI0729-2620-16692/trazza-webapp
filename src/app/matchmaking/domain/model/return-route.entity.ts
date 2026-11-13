import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Place} from '../../../shared/domain/model/place.value-object';

export interface RouteVehicle {
  id: string;
  plate: string;
  model: string;
}

/** An empty return trip that a carrier publishes so merchants' shipments can fill it (one or two of them). */
export class ReturnRoute implements BaseEntity {
  static readonly MAX_SHIPMENTS = 2;

  id: string;
  origin: Place;
  destination: Place;
  departureAt: string;
  maxShipments: number;
  status: string;
  vehicle: RouteVehicle;
  driverId: number | null;
  driverName: string | null;
  acceptedShipments: number;
  availableWeightKg: number;
  availableVolumeM3: number;
  pendingProposals: number;
  createdAt: string | null;

  constructor(props: {
    id: string; origin: Place; destination: Place; departureAt: string; maxShipments: number; status: string;
    vehicle: RouteVehicle; driverId?: number | null; driverName?: string | null; acceptedShipments?: number;
    availableWeightKg?: number; availableVolumeM3?: number; pendingProposals?: number; createdAt?: string | null;
  }) {
    this.id = props.id;
    this.origin = { ...props.origin };
    this.destination = { ...props.destination };
    this.departureAt = props.departureAt;
    this.maxShipments = props.maxShipments;
    this.status = props.status;
    this.vehicle = props.vehicle ?? { id: '', plate: '', model: '' };
    this.driverId = props.driverId ?? null;
    this.driverName = props.driverName ?? null;
    this.acceptedShipments = props.acceptedShipments ?? 0;
    this.availableWeightKg = props.availableWeightKg ?? 0;
    this.availableVolumeM3 = props.availableVolumeM3 ?? 0;
    this.pendingProposals = props.pendingProposals ?? 0;
    this.createdAt = props.createdAt ?? null;
  }

  get label(): string {
    return `${this.origin.address} → ${this.destination.address}`;
  }

  get isOpen(): boolean {
    return this.status === 'PUBLISHED';
  }

  get isClosed(): boolean {
    return this.status === 'COMPLETED' || this.status === 'CANCELLED';
  }

  get canBeCancelled(): boolean {
    return !this.isClosed && this.acceptedShipments === 0;
  }

  get freeSlots(): number {
    return Math.max(0, this.maxShipments - this.acceptedShipments);
  }
}
