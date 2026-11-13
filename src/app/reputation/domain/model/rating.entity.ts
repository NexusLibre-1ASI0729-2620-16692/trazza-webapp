import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Score} from './score.value-object';
import {RatingTarget} from './rating-target.value-object';

export interface RatingProps {
  id?: number;
  shipmentId: number;
  raterId: number;
  raterName?: string;
  target: RatingTarget;
  score: Score;
  tags?: string[];
  comment?: string;
  createdAt?: string | null;
}

export class Rating implements BaseEntity {
  static readonly MAX_COMMENT_LENGTH = 300;

  readonly #id: number;
  readonly #shipmentId: number;
  readonly #raterId: number;
  readonly #raterName: string;
  readonly #target: RatingTarget;
  readonly #score: Score;
  readonly #tags: readonly string[];
  readonly #comment: string;
  readonly #createdAt: string;

  constructor(props: RatingProps) {
    if (!props.shipmentId) throw new Error('validation.shipment-required');
    if (!props.raterId) throw new Error('validation.user-required');
    if (!(props.target instanceof RatingTarget)) throw new Error('validation.party-invalid');
    if (props.target.userId === props.raterId) throw new Error('validation.cannot-rate-yourself');
    if (!(props.score instanceof Score)) throw new Error('validation.score-invalid');
    const uniqueTags = [...new Set(props.tags ?? [])];
    if (!uniqueTags.every(tag => props.target.allowedTags.includes(tag))) throw new Error('validation.rating-tag-invalid');
    const text = (props.comment ?? '').trim();
    if (text.length > Rating.MAX_COMMENT_LENGTH) throw new Error('validation.description-too-long');
    this.#id = props.id ?? 0;
    this.#shipmentId = props.shipmentId;
    this.#raterId = props.raterId;
    this.#raterName = props.raterName ?? '';
    this.#target = props.target;
    this.#score = props.score;
    this.#tags = Object.freeze(uniqueTags);
    this.#comment = text;
    this.#createdAt = props.createdAt ?? new Date().toISOString();
  }

  get id(): number {
    return this.#id;
  }

  get shipmentId(): number {
    return this.#shipmentId;
  }

  get raterId(): number {
    return this.#raterId;
  }

  get raterName(): string {
    return this.#raterName;
  }

  get target(): RatingTarget {
    return this.#target;
  }

  get score(): Score {
    return this.#score;
  }

  get tags(): readonly string[] {
    return this.#tags;
  }

  get comment(): string {
    return this.#comment;
  }

  get createdAt(): string {
    return this.#createdAt;
  }
}
