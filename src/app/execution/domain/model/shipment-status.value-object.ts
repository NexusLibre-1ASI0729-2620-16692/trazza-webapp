export class ShipmentStatus {
  static readonly MATCHED = 'matched';
  static readonly PICKED_UP = 'picked_up';
  static readonly IN_TRANSIT = 'in_transit';
  static readonly DELIVERED = 'delivered';
  static readonly CLOSED = 'closed';
  static readonly CANCELLED = 'cancelled';

  static readonly VALUES = [
    ShipmentStatus.MATCHED,
    ShipmentStatus.PICKED_UP,
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.DELIVERED,
    ShipmentStatus.CLOSED,
    ShipmentStatus.CANCELLED
  ] as const;

  readonly #value: string;

  constructor(value: string) {
    if (
      !ShipmentStatus.VALUES.includes(
        value as typeof ShipmentStatus.VALUES[number]
      )
    ) {
      throw new Error('validation.status-invalid');
    }

    this.#value = value;
  }

  get value(): string {
    return this.#value;
  }

  get isActive(): boolean {
    return [
      ShipmentStatus.MATCHED,
      ShipmentStatus.PICKED_UP,
      ShipmentStatus.IN_TRANSIT
    ].includes(this.#value);
  }

  get isMoving(): boolean {
    return [
      ShipmentStatus.PICKED_UP,
      ShipmentStatus.IN_TRANSIT
    ].includes(this.#value);
  }

  get isDelivered(): boolean {
    return [
      ShipmentStatus.DELIVERED,
      ShipmentStatus.CLOSED
    ].includes(this.#value);
  }

  get isCancelled(): boolean {
    return this.#value === ShipmentStatus.CANCELLED;
  }

  get step(): number {
    const steps: Record<string, number> = {
      matched: 1,
      picked_up: 2,
      in_transit: 3,
      delivered: 4,
      closed: 4,
      cancelled: 0
    };

    return steps[this.#value];
  }
}
