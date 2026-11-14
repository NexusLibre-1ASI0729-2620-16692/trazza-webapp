import {BaseEntity} from '../../../shared/domain/model/base-entity';

/** Score (1 to 5) that one side of a confirmed trip gives the other. */
export class Rating implements BaseEntity {
  static readonly MIN_SCORE = 1;
  static readonly MAX_SCORE = 5;

  id: number;
  tripId: string;
  counterpartId: string;
  counterpartName: string;
  score: number;
  comment: string | null;
  createdAt: string;

  constructor(props: { id: number; tripId: string; counterpartId: string; counterpartName: string; score: number; comment?: string | null; createdAt: string }) {
    this.id = props.id;
    this.tripId = props.tripId;
    this.counterpartId = props.counterpartId;
    this.counterpartName = props.counterpartName;
    this.score = props.score;
    this.comment = props.comment ?? null;
    this.createdAt = props.createdAt;
  }

  static assertScore(score: number): void {
    if (!Number.isInteger(score) || score < Rating.MIN_SCORE || score > Rating.MAX_SCORE) throw new Error('validation.score-range');
  }
}
