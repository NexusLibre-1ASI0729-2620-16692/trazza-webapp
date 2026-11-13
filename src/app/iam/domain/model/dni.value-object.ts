export class Dni {
  private static readonly PATTERN = /^\d{8}$/;
  public readonly value: string;

  constructor(value: string | null | undefined) {
    const normalized = (value ?? '').trim();
    if (!Dni.PATTERN.test(normalized)) throw new Error('validation.dni-invalid');
    this.value = normalized;
    Object.freeze(this);
  }
}