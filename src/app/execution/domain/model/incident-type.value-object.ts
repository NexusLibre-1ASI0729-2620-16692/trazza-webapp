export class IncidentType {
  static readonly VALUES = [
    'damaged_goods',
    'missing_items',
    'delay',
    'vehicle_breakdown',
    'wrong_address',
    'other'
  ] as const;

  readonly #value: string;

  constructor(value: string) {
    if (
      !IncidentType.VALUES.includes(
        value as typeof IncidentType.VALUES[number]
      )
    ) {
      throw new Error('validation.incident-type-invalid');
    }

    this.#value = value;
  }

  get value(): string {
    return this.#value;
  }
}
