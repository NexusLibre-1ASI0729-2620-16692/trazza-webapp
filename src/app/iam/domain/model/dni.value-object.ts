/** Peruvian national identity document: eight digits. */
export class Dni {
  static readonly PATTERN = /^\d{8}$/;

  readonly value: string;

  constructor(value: string | null | undefined) {
    const normalized = (value ?? '').toString().trim();
    if (!Dni.PATTERN.test(normalized)) throw new Error('validation.dni-invalid');
    this.value = normalized;
  }
}
