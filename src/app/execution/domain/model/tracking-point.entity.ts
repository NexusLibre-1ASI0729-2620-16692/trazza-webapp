import {BaseEntity} from '../../../shared/domain/model/base-entity';

/** A GPS position of the truck, sent by the driver's phone or by a loaned IoT device. */
export interface TrackingPoint extends BaseEntity {
  id: number;
  latitude: number;
  longitude: number;
  speedKmh: number | null;
  source: string;
  recordedAt: string;
}
