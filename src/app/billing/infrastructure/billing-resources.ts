import {SettlementTrip} from '../domain/model/settlement-trip.value-object';
import {SubscriptionPayment} from '../domain/model/subscription.entity';

export interface PlanResource {
  code: string;
  name: string;
  monitoringType: string;
  pricingUnit: string;
  price: number;
  currency: string;
  billingPeriod: string;
  minVehicles: number;
  maxVehicles: number | null;
  includesIotDevice: boolean;
}

export interface SubscriptionResource {
  id: number;
  plan: PlanResource;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  monthlyAmount: number;
  vehicles: { id: string; plate: string }[];
  payments: SubscriptionPayment[];
  cancelledAt: string | null;
  createdAt: string | null;
}

export interface FreightSettlementResource {
  trip: SettlementTrip;
  myRole: string;
  amount: number;
  currency: string;
  status: string;
  merchantMarkedPaidAt: string | null;
  carrierConfirmedAt: string | null;
  externalReference: string | null;
}

export interface CancellationCompensationResource {
  trip: SettlementTrip;
  myRole: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  settledAt: string | null;
}
