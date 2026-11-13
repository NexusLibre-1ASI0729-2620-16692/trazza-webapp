export class UserRole {
  public static readonly CARRIER = 'carrier';
  public static readonly MERCHANT = 'merchant';
  public static readonly VALUES = [UserRole.CARRIER, UserRole.MERCHANT] as const;

  public readonly value: string;

  constructor(value: string) {
    if (!UserRole.VALUES.includes(value as any)) throw new Error('validation.role-invalid');
    this.value = value;
    Object.freeze(this);
  }

  get isCarrier(): boolean { return this.value === UserRole.CARRIER; }
  get isMerchant(): boolean { return this.value === UserRole.MERCHANT; }
}