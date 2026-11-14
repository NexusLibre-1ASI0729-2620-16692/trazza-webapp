import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Place} from '../../../shared/domain/model/place.value-object';
import {ACTIVE_TRIP_STATUSES, TripStatus} from './trip-status.value-object';
import {TrackingPoint} from './tracking-point.entity';

export interface TripParty {
  name: string;
  phone: string | null;
}

export interface TripProps {
  id: string;
  status: string;
  myRole: string;
  agreedRate: number;
  currency: string;
  matchProposalId: string | null;
  returnRouteId: string | null;
  shipmentRequestId: string | null;
  description: string;
  weightKg: number;
  volumeM3: number;
  origin: Place;
  destination: Place;
  pickup: Place;
  delivery: Place;
  departureAt: string;
  carrier: TripParty;
  merchant: TripParty;
  vehicle: { id: string; plate: string };
  driverId: number | null;
  driverName: string | null;
  lastPoint: TrackingPoint | null;
  openAlerts: number;
  totalDistanceKm: number | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string | null;
}

/**
 * Execution of an accepted proposal. The carrier picks the cargo up and delivers it; the merchant confirms the
 * delivery. Only a trip that has not been picked up can be cancelled.
 */
export class Trip implements BaseEntity, TripProps {
  id!: string;
  status!: string;
  myRole!: string;
  agreedRate!: number;
  currency!: string;
  matchProposalId!: string | null;
  returnRouteId!: string | null;
  shipmentRequestId!: string | null;
  description!: string;
  weightKg!: number;
  volumeM3!: number;
  origin!: Place;
  destination!: Place;
  pickup!: Place;
  delivery!: Place;
  departureAt!: string;
  carrier!: TripParty;
  merchant!: TripParty;
  vehicle!: { id: string; plate: string };
  driverId!: number | null;
  driverName!: string | null;
  lastPoint!: TrackingPoint | null;
  openAlerts!: number;
  totalDistanceKm!: number | null;
  pickedUpAt!: string | null;
  deliveredAt!: string | null;
  confirmedAt!: string | null;
  cancelledAt!: string | null;
  cancellationReason!: string | null;
  createdAt!: string | null;

  constructor(props: TripProps) {
    Object.assign(this, props);
    this.openAlerts = props.openAlerts ?? 0;
    this.carrier = props.carrier ?? { name: '', phone: null };
    this.merchant = props.merchant ?? { name: '', phone: null };
  }

  get label(): string {
    return `${this.pickup.address} → ${this.delivery.address}`;
  }

  get isCarrier(): boolean {
    return this.myRole === 'CARRIER';
  }

  get isMerchant(): boolean {
    return this.myRole === 'MERCHANT';
  }

  get isActive(): boolean {
    return ACTIVE_TRIP_STATUSES.includes(this.status);
  }

  get isClosed(): boolean {
    return this.status === TripStatus.CONFIRMED || this.status === TripStatus.CANCELLED;
  }

  get isOnTheRoad(): boolean {
    return this.status === TripStatus.PICKED_UP || this.status === TripStatus.IN_TRANSIT;
  }

  get canPickUp(): boolean {
    return this.isCarrier && this.status === TripStatus.SCHEDULED;
  }

  get canDeliver(): boolean {
    return this.isCarrier && this.isOnTheRoad;
  }

  get canConfirm(): boolean {
    return this.isMerchant && this.status === TripStatus.DELIVERED;
  }

  get canCancel(): boolean {
    return this.status === TripStatus.SCHEDULED;
  }

  get canTrack(): boolean {
    return this.isCarrier && this.isOnTheRoad;
  }

  get canAssignDriver(): boolean {
    return this.isCarrier && this.status === TripStatus.SCHEDULED;
  }

  get hasSettlement(): boolean {
    return this.status !== TripStatus.SCHEDULED && this.status !== TripStatus.CANCELLED;
  }

  get counterpart(): TripParty {
    return this.isCarrier ? this.merchant : this.carrier;
  }

  /** A merchant who cancels after the departure time owes the carrier a lost-profit compensation. */
  get cancellationMayCauseCompensation(): boolean {
    return this.isMerchant && new Date(this.departureAt) <= new Date();
  }
}
