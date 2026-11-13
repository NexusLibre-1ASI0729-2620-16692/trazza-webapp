export type RatingTargetRole = 'carrier' | 'merchant';

export class RatingTarget {
  static readonly TAGS: Readonly<Record<RatingTargetRole, readonly string[]>> = Object.freeze({
    carrier: Object.freeze(['on_time', 'careful_with_goods', 'friendly', 'good_communication']),
    merchant: Object.freeze(['on_time_pickup', 'accurate_load_info', 'friendly', 'good_communication'])
  });

  readonly #userId: number;
  readonly #role: RatingTargetRole;
  readonly #name: string;

  constructor(props: { userId: number; role: string; name?: string }) {
    if (!props.userId) throw new Error('validation.user-required');
    if (!Object.hasOwn(RatingTarget.TAGS, props.role)) throw new Error('validation.party-invalid');
    this.#userId = props.userId;
    this.#role = props.role as RatingTargetRole;
    this.#name = props.name ?? '';
  }

  get userId(): number {
    return this.#userId;
  }

  get role(): RatingTargetRole {
    return this.#role;
  }

  get name(): string {
    return this.#name;
  }

  get allowedTags(): readonly string[] {
    return RatingTarget.TAGS[this.#role];
  }
}
