/** Peruvian taxpayer number: eleven digits that start with 10 (person) or 20 (company). */
export class Ruc {
  static readonly PATTERN = /^(10|20)\d{9}$/;

  readonly value: string;

  constructor(value: string | null | undefined) {
    const normalized = (value ?? '').toString().trim();
    if (!Ruc.PATTERN.test(normalized)) throw new Error('validation.ruc-invalid');
    this.value = normalized;
  }

  get isCompany(): boolean {
    return this.value.startsWith('20');
  }
}
