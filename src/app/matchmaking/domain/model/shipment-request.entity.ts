import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Place} from '../../../shared/domain/model/place.value-object';

/** Cargo that a merchant needs to move, with a pick-up window. */
export class ShipmentRequest implements BaseEntity {
  id: string;
  description: string;
  weightKg: number;
  volumeM3: number;
  pickup: Place;
  delivery: Place;
  pickupFrom: string;
  pickupUntil: string;
  status: string;
  merchantName: string;
  pendingProposals: number;
  cancellationReason: string | null;
  cancelledAt: string | null;
  createdAt: string | null;

  constructor(props: {
    id: string; description: string; weightKg: number; volumeM3: number; pickup: Place; delivery: Place;
    pickupFrom: string; pickupUntil: string; status: string; merchantName?: string; pendingProposals?: number;
    cancellationReason?: string | null; cancelledAt?: string | null; createdAt?: string | null;
  }) {
    this.id = props.id;
    this.description = props.description;
    this.weightKg = props.weightKg;
    this.volumeM3 = props.volumeM3;
    this.pickup = { ...props.pickup };
    this.delivery = { ...props.delivery };
    this.pickupFrom = props.pickupFrom;
    this.pickupUntil = props.pickupUntil;
    this.status = props.status;
    this.merchantName = props.merchantName ?? '';
    this.pendingProposals = props.pendingProposals ?? 0;
    this.cancellationReason = props.cancellationReason ?? null;
    this.cancelledAt = props.cancelledAt ?? null;
    this.createdAt = props.createdAt ?? null;
  }

  get label(): string {
    return `${this.pickup.address} → ${this.delivery.address}`;
  }

  get isOpen(): boolean {
    return this.status === 'OPEN';
  }
}
