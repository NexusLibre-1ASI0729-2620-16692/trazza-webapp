export type PaymentStatusValue = 'pending' | 'paid' | 'failed';

export class PaymentStatus {
  static readonly PENDING: PaymentStatusValue = 'pending';
  static readonly PAID: PaymentStatusValue = 'paid';
  static readonly FAILED: PaymentStatusValue = 'failed';
  static readonly VALUES: readonly PaymentStatusValue[] = Object.freeze([PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.FAILED]);

  readonly #value: PaymentStatusValue;

  constructor(value: string) {
    if (!PaymentStatus.VALUES.includes(value as PaymentStatusValue)) throw new Error('validation.status-invalid');
    this.#value = value as PaymentStatusValue;
  }

  get value(): PaymentStatusValue {
    return this.#value;
  }

  get isPaid(): boolean {
    return this.#value === PaymentStatus.PAID;
  }

  get isPending(): boolean {
    return this.#value === PaymentStatus.PENDING;
  }
}
