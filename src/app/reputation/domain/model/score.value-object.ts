export class Score {
  static readonly MIN = 1;
  static readonly MAX = 5;

  readonly #value: number;

  constructor(value: number) {
    const stars = Number(value);
    if (!Number.isInteger(stars) || stars < Score.MIN || stars > Score.MAX) throw new Error('validation.score-invalid');
    this.#value = stars;
  }

  get value(): number {
    return this.#value;
  }

  get isPositive(): boolean {
    return this.#value >= 4;
  }
}
