import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Plan} from './plan.entity';

export interface SubscriptionPayment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  gatewayPaymentId: string | null;
  paidAt: string | null;
}

export class Subscription implements BaseEntity {
  id: number;
  plan: Plan;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  monthlyAmount: number;
  vehicles: { id: string; plate: string }[];
  payments: SubscriptionPayment[];
  cancelledAt: string | null;
  createdAt: string | null;

  constructor(props: {
    id: number; plan: Plan; status: string; currentPeriodStart: string; currentPeriodEnd: string; monthlyAmount: number;
    vehicles?: { id: string; plate: string }[]; payments?: SubscriptionPayment[]; cancelledAt?: string | null; createdAt?: string | null;
  }) {
    this.id = props.id;
    this.plan = props.plan;
    this.status = props.status;
    this.currentPeriodStart = props.currentPeriodStart;
    this.currentPeriodEnd = props.currentPeriodEnd;
    this.monthlyAmount = props.monthlyAmount;
    this.vehicles = [...(props.vehicles ?? [])];
    this.payments = [...(props.payments ?? [])];
    this.cancelledAt = props.cancelledAt ?? null;
    this.createdAt = props.createdAt ?? null;
  }

  get isCancelled(): boolean {
    return this.status === 'CANCELLED';
  }
}
