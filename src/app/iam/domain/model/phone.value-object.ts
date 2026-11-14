/** Peruvian mobile number: nine digits that start with 9. A +51 prefix is accepted and removed. */
export class Phone {
  static readonly PATTERN = /^9\d{8}$/;

  readonly value: string;

  constructor(value: string | null | undefined) {
    const digits = (value ?? '').replace(/\D/g, '').replace(/^51(?=9\d{8}$)/, '');
    if (!Phone.PATTERN.test(digits)) throw new Error('validation.phone-invalid');
    this.value = digits;
  }

  get formatted(): string {
    return `+51 ${this.value.slice(0, 3)} ${this.value.slice(3, 6)} ${this.value.slice(6)}`;
  }
}
