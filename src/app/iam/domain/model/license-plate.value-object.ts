/** Peruvian licence plate, normalised to ABC-123. */
export class LicensePlate {
  static readonly PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;

  readonly value: string;

  constructor(value: string | null | undefined) {
    const compact = (value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normalized = compact.length === 6 ? `${compact.slice(0, 3)}-${compact.slice(3)}` : compact;
    if (!LicensePlate.PATTERN.test(normalized)) throw new Error('validation.plate-invalid');
    this.value = normalized;
  }

  equals(other: LicensePlate): boolean {
    return other instanceof LicensePlate && other.value === this.value;
  }
}
