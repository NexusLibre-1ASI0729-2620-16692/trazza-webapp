import {SettlementTrip} from './settlement-trip.value-object';

export type CompensationAction = 'confirm-paid' | 'waive' | 'dispute';

/** Lost profit the merchant owes the carrier (30% of the rate) when a trip is cancelled after its departure time. */
export class CancellationCompensation {
  trip: SettlementTrip;
  myRole: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  settledAt: string | null;

  constructor(props: {
    trip: SettlementTrip; myRole: string; amount: number; currency: string; status: string; createdAt: string; settledAt?: string | null;
  }) {
    this.trip = props.trip;
    this.myRole = props.myRole;
    this.amount = props.amount;
    this.currency = props.currency;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.settledAt = props.settledAt ?? null;
  }

  get id(): string {
    return this.trip.id;
  }

  get isOpen(): boolean {
    return this.status === 'PENDING' || this.status === 'DISPUTED';
  }

  get canSettle(): boolean {
    return this.myRole === 'CARRIER' && this.isOpen;
  }

  get canDispute(): boolean {
    return this.myRole === 'MERCHANT' && this.status === 'PENDING';
  }
}
