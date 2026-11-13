export class Email {
  private static readonly PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  public readonly value: string;

  constructor(value: string | null | undefined) {
    const normalized = (value ?? '').trim().toLowerCase();
    if (!Email.PATTERN.test(normalized)) throw new Error('validation.email-invalid');
    this.value = normalized;
    Object.freeze(this);
  }
}