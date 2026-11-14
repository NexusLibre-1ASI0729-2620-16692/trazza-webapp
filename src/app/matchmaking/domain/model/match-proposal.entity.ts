import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {ReturnRoute} from './return-route.entity';
import {ShipmentRequest} from './shipment-request.entity';

export interface Party {
  name: string;
  phone: string | null;
}

/** A carrier's offer to carry a shipment on one of its return routes. Accepting it creates the trip. */
export class MatchProposal implements BaseEntity {
  id: string;
  offeredRate: number;
  currency: string;
  status: string;
  respondedAt: string | null;
  createdAt: string | null;
  route: ReturnRoute;
  shipment: ShipmentRequest;
  carrier: Party;
  merchant: Party;
  tripId: string | null;

  constructor(props: {
    id: string; offeredRate: number; currency: string; status: string; respondedAt?: string | null; createdAt?: string | null;
    route: ReturnRoute; shipment: ShipmentRequest; carrier: Party; merchant: Party; tripId?: string | null;
  }) {
    this.id = props.id;
    this.offeredRate = props.offeredRate;
    this.currency = props.currency;
    this.status = props.status;
    this.respondedAt = props.respondedAt ?? null;
    this.createdAt = props.createdAt ?? null;
    this.route = props.route;
    this.shipment = props.shipment;
    this.carrier = props.carrier ?? { name: '', phone: null };
    this.merchant = props.merchant ?? { name: '', phone: null };
    this.tripId = props.tripId ?? null;
  }

  get isPending(): boolean {
    return this.status === 'PENDING';
  }

  get isAccepted(): boolean {
    return this.status === 'ACCEPTED';
  }

  /** The chat stays open while the offer is pending and after it is accepted. */
  get chatOpen(): boolean {
    return this.isPending || this.isAccepted;
  }
}
