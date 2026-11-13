export class Phone {
  private static readonly PATTERN = /^9\d{8}$/;
  public readonly value: string;

  constructor(value: string | null | undefined) {
    const normalized = (value ?? '').trim();
    if (!Phone.PATTERN.test(normalized)) throw new Error('validation.phone-invalid');
    this.value = normalized;
    Object.freeze(this);
  }
}