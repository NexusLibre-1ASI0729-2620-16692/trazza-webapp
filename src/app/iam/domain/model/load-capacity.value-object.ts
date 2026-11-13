export class LoadCapacity {
  public readonly weightKg: number;
  public readonly volumeM3: number;

  constructor(weightKg: number, volumeM3: number) {
    const w = Number(weightKg);
    const v = Number(volumeM3);
    if (isNaN(w) || w <= 0) throw new Error('validation.capacity-weight-invalid');
    if (isNaN(v) || v <= 0) throw new Error('validation.capacity-volume-invalid');
    this.weightKg = w;
    this.volumeM3 = v;
    Object.freeze(this);
  }
}