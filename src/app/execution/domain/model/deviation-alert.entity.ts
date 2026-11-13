import {BaseEntity} from '../../../shared/domain/model/base-entity';

/** Raised by the platform when a tracking point is too far from the agreed route. */
export class DeviationAlert implements BaseEntity {
  id: number;
  latitude: number;
  longitude: number;
  deviationKm: number;
  detectedAt: string;
  acknowledgedAt: string | null;

  constructor(props: { id: number; latitude: number; longitude: number; deviationKm: number; detectedAt: string; acknowledgedAt?: string | null }) {
    this.id = props.id;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.deviationKm = props.deviationKm;
    this.detectedAt = props.detectedAt;
    this.acknowledgedAt = props.acknowledgedAt ?? null;
  }

  get isOpen(): boolean {
    return this.acknowledgedAt === null;
  }
}
