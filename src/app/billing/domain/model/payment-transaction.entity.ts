import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Money} from '../../../shared/domain/model/money.value-object';
import {SubscriptionPlan} from './subscription-plan.value-object';
import {PaymentMethod} from './payment-method.value-object';
import {PaymentStatus} from './payment-status.value-object';

export interface PaymentTransactionProps {
  id?: number;
  userId: number;
  plan: SubscriptionPlan;
  amount: Money;
  method: PaymentMethod;
  status: PaymentStatus;
  authorizationCode?: string | null;
  createdAt?: string | null;
  paidAt?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
}

export class PaymentTransaction implements BaseEntity {
  readonly #id: number;
  readonly #userId: number;
  readonly #plan: SubscriptionPlan;
  readonly #amount: Money;
  readonly #method: PaymentMethod;
  #status: PaymentStatus;
  #authorizationCode: string | null;
  readonly #createdAt: string | null;
  #paidAt: string | null;
  #periodStart: string | null;
  #periodEnd: string | null;

  constructor(props: PaymentTransactionProps) {
    if (!props.userId) throw new Error('validation.user-required');
    if (!(props.plan instanceof SubscriptionPlan)) throw new Error('validation.plan-invalid');
    if (!(props.amount instanceof Money)) throw new Error('validation.money-invalid');
    if (!props.amount.equals(props.plan.price)) throw new Error('validation.amount-mismatch');
    if (!(props.method instanceof PaymentMethod)) throw new Error('validation.card-number-invalid');
    if (!(props.status instanceof PaymentStatus)) throw new Error('validation.status-invalid');
    this.#id = props.id ?? 0;
    this.#userId = props.userId;
    this.#plan = props.plan;
    this.#amount = props.amount;
    this.#method = props.method;
    this.#status = props.status;
    this.#authorizationCode = props.authorizationCode ?? null;
    this.#createdAt = props.createdAt ?? null;
    this.#paidAt = props.paidAt ?? null;
    this.#periodStart = props.periodStart ?? null;
    this.#periodEnd = props.periodEnd ?? null;
  }

  static create(props: { userId: number; plan: SubscriptionPlan; method: PaymentMethod }): PaymentTransaction {
    if (props.plan.isFree) throw new Error('validation.plan-free-not-chargeable');
    return new PaymentTransaction({
      userId: props.userId,
      plan: props.plan,
      amount: props.plan.price,
      method: props.method,
      status: new PaymentStatus(PaymentStatus.PENDING),
      createdAt: new Date().toISOString()
    });
  }

  get id(): number {
    return this.#id;
  }

  get userId(): number {
    return this.#userId;
  }

  get plan(): SubscriptionPlan {
    return this.#plan;
  }

  get amount(): Money {
    return this.#amount;
  }

  get method(): PaymentMethod {
    return this.#method;
  }

  get status(): PaymentStatus {
    return this.#status;
  }

  get authorizationCode(): string | null {
    return this.#authorizationCode;
  }

  get createdAt(): string | null {
    return this.#createdAt;
  }

  get paidAt(): string | null {
    return this.#paidAt;
  }

  get periodStart(): string | null {
    return this.#periodStart;
  }

  get periodEnd(): string | null {
    return this.#periodEnd;
  }

  markPaid(authorizationCode: string, now: Date = new Date()): void {
    if (!this.#status.isPending) throw new Error('validation.transaction-not-pending');
    if (!authorizationCode) throw new Error('validation.authorization-required');
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);
    this.#status = new PaymentStatus(PaymentStatus.PAID);
    this.#authorizationCode = authorizationCode;
    this.#paidAt = now.toISOString();
    this.#periodStart = now.toLocaleDateString('en-CA');
    this.#periodEnd = end.toLocaleDateString('en-CA');
  }

  markFailed(): void {
    if (!this.#status.isPending) throw new Error('validation.transaction-not-pending');
    this.#status = new PaymentStatus(PaymentStatus.FAILED);
  }

  covers(today: string): boolean {
    return this.#status.isPaid && this.#periodStart !== null && this.#periodEnd !== null
      && this.#periodStart <= today && today <= this.#periodEnd;
  }
}
