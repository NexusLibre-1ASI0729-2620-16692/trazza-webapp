export class Ruc {
  private static readonly PATTERN = /^(10|20)\d{9}$/;
  public readonly value: string;

  constructor(value: string | null | undefined) {
    const normalized = (value ?? '').trim();
    if (!Ruc.PATTERN.test(normalized)) throw new Error('validation.ruc-invalid');
    this.value = normalized;
    Object.freeze(this);
  }

  get isCompany(): boolean {
    return this.value.startsWith('20');
  }
}