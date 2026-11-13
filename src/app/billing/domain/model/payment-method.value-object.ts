export type CardBrand = 'visa' | 'mastercard' | 'amex';

export class PaymentMethod {
  static readonly BRANDS: readonly CardBrand[] = Object.freeze(['visa', 'mastercard', 'amex']);
  static readonly EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;

  readonly #brand: CardBrand;
  readonly #last4: string;
  readonly #holderName: string;
  readonly #expiry: string;

  constructor(props: { brand: string; last4: string; holderName: string; expiry: string }) {
    if (!PaymentMethod.BRANDS.includes(props.brand as CardBrand)) throw new Error('validation.card-brand-invalid');
    if (!/^\d{4}$/.test(props.last4 ?? '')) throw new Error('validation.card-number-invalid');
    if ((props.holderName ?? '').trim().length < 3) throw new Error('validation.card-holder-required');
    if (!PaymentMethod.EXPIRY_PATTERN.test(props.expiry ?? '')) throw new Error('validation.card-expiry-invalid');
    this.#brand = props.brand as CardBrand;
    this.#last4 = props.last4;
    this.#holderName = props.holderName.trim().toUpperCase();
    this.#expiry = props.expiry;
  }

  static fromCard(props: { number: string; holderName: string; expiry: string; today?: Date }): PaymentMethod {
    const digits = (props.number ?? '').replace(/\D/g, '');
    const today = props.today ?? new Date();
    if (digits.length < 13 || digits.length > 19 || !PaymentMethod.passesLuhn(digits)) throw new Error('validation.card-number-invalid');
    if (!PaymentMethod.EXPIRY_PATTERN.test(props.expiry ?? '')) throw new Error('validation.card-expiry-invalid');
    const [month, year] = props.expiry.split('/').map(Number);
    const lastValidDay = new Date(2000 + year, month, 0, 23, 59, 59);
    if (lastValidDay < today) throw new Error('validation.card-expired');
    return new PaymentMethod({ brand: PaymentMethod.detectBrand(digits), last4: digits.slice(-4), holderName: props.holderName, expiry: props.expiry });
  }

  static passesLuhn(digits: string): boolean {
    let sum = 0;
    let double = false;
    for (let index = digits.length - 1; index >= 0; index--) {
      let digit = Number(digits[index]);
      if (double) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      double = !double;
    }
    return sum % 10 === 0;
  }

  static detectBrand(digits: string): CardBrand {
    if (/^4/.test(digits)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    throw new Error('validation.card-brand-invalid');
  }

  get brand(): CardBrand {
    return this.#brand;
  }

  get last4(): string {
    return this.#last4;
  }

  get holderName(): string {
    return this.#holderName;
  }

  get expiry(): string {
    return this.#expiry;
  }

  get label(): string {
    return `${this.#brand.toUpperCase()} •••• ${this.#last4}`;
  }
}
