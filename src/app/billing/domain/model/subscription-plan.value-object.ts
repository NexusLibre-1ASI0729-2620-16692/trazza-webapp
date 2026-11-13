import {Money} from '../../../shared/domain/model/money.value-object';

export type SubscriptionPlanCode = 'free' | 'pro';

export class SubscriptionPlan {
  static readonly FREE: SubscriptionPlanCode = 'free';
  static readonly PRO: SubscriptionPlanCode = 'pro';
  static readonly CATALOG: Readonly<Record<SubscriptionPlanCode, { price: number; monthlyPublications: number | null }>> = Object.freeze({
    free: Object.freeze({ price: 0, monthlyPublications: 5 }),
    pro: Object.freeze({ price: 39.9, monthlyPublications: null })
  });

  readonly #code: SubscriptionPlanCode;

  constructor(code: string) {
    if (!Object.hasOwn(SubscriptionPlan.CATALOG, code)) throw new Error('validation.plan-invalid');
    this.#code = code as SubscriptionPlanCode;
  }

  get code(): SubscriptionPlanCode {
    return this.#code;
  }

  get price(): Money {
    return new Money({ amount: SubscriptionPlan.CATALOG[this.#code].price });
  }

  get monthlyPublications(): number | null {
    return SubscriptionPlan.CATALOG[this.#code].monthlyPublications;
  }

  get isFree(): boolean {
    return this.#code === SubscriptionPlan.FREE;
  }

  allowsPublication(usedThisMonth: number): boolean {
    const limit = this.monthlyPublications;
    return limit === null || usedThisMonth < limit;
  }
}
