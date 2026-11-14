export class Email {
  static readonly PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  readonly value: string;

  constructor(value: string | null | undefined) {
    const normalized = (value ?? '').trim().toLowerCase();
    if (!Email.PATTERN.test(normalized)) throw new Error('validation.email-invalid');
    this.value = normalized;
  }

  equals(other: Email): boolean {
    return other instanceof Email && other.value === this.value;
  }
}
