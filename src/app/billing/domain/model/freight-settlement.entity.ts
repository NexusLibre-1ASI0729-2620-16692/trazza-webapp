import {SettlementTrip} from './settlement-trip.value-object';

/** The freight of a trip. It is paid outside the platform: the merchant marks it paid and the carrier confirms it. */
export class FreightSettlement {
  trip: SettlementTrip;
  myRole: string;
  amount: number;
  currency: string;
  status: string;
  merchantMarkedPaidAt: string | null;
  carrierConfirmedAt: string | null;
  externalReference: string | null;

  constructor(props: {
    trip: SettlementTrip; myRole: string; amount: number; currency: string; status: string; merchantMarkedPaidAt?: string | null;
    carrierConfirmedAt?: string | null; externalReference?: string | null;
  }) {
    this.trip = props.trip;
    this.myRole = props.myRole;
    this.amount = props.amount;
    this.currency = props.currency;
    this.status = props.status;
    this.merchantMarkedPaidAt = props.merchantMarkedPaidAt ?? null;
    this.carrierConfirmedAt = props.carrierConfirmedAt ?? null;
    this.externalReference = props.externalReference ?? null;
  }

  get id(): string {
    return this.trip.id;
  }

  get canMarkPaid(): boolean {
    return this.myRole === 'MERCHANT' && this.status === 'PENDING';
  }

  get canConfirm(): boolean {
    return this.myRole === 'CARRIER' && this.status === 'MARKED_PAID';
  }
}
