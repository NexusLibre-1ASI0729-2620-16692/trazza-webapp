export interface LoyaltyEntry {
  id: number;
  points: number;
  reason: string;
  createdAt: string;
}

/** Points earned by finishing and rating trips, which can be redeemed. */
export class LoyaltyAccount {
  balance: number;
  entries: LoyaltyEntry[];

  constructor(props: { balance?: number; entries?: LoyaltyEntry[] } = {}) {
    this.balance = props.balance ?? 0;
    this.entries = [...(props.entries ?? [])];
  }

  assertCanRedeem(points: number | null): void {
    if (points === null || !Number.isInteger(points) || points <= 0) throw new Error('validation.points-positive');
    if (points > this.balance) throw new Error('validation.points-insufficient');
  }
}
