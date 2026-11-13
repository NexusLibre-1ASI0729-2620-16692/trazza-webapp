export class LicensePlate {
  private static readonly PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;
  public readonly value: string;

  constructor(value: string | null | undefined) {
    const normalized = (value ?? '').trim().toUpperCase();
    if (!LicensePlate.PATTERN.test(normalized)) throw new Error('validation.plate-invalid');
    this.value = normalized;
    Object.freeze(this);
  }
}