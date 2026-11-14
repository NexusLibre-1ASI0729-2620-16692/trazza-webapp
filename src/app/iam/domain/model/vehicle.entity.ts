import {BaseEntity} from '../../../shared/domain/model/base-entity';

/** A truck of the carrier's fleet. The cargo volume is computed by the platform when it is not given. */
export class Vehicle implements BaseEntity {
  id: string;
  plate: string;
  model: string;
  maxLoadKg: number;
  cargoLengthM: number;
  cargoWidthM: number;
  cargoHeightM: number;
  cargoVolumeM3: number | null;
  photoS3Key: string | null;
  isActive: boolean;

  constructor(props: Partial<Vehicle> = {}) {
    this.id = props.id ?? '';
    this.plate = props.plate ?? '';
    this.model = props.model ?? '';
    this.maxLoadKg = props.maxLoadKg ?? 3000;
    this.cargoLengthM = props.cargoLengthM ?? 4;
    this.cargoWidthM = props.cargoWidthM ?? 2;
    this.cargoHeightM = props.cargoHeightM ?? 2;
    this.cargoVolumeM3 = props.cargoVolumeM3 ?? null;
    this.photoS3Key = props.photoS3Key ?? null;
    this.isActive = props.isActive ?? true;
  }

  get label(): string {
    return `${this.plate} · ${this.model}`;
  }
}
