import {BaseEntity} from '../../../shared/domain/model/base-entity';

/** An address the user reuses when publishing routes or shipments. */
export class SavedAddress implements BaseEntity {
  id: number;
  label: string;
  address: string;
  district: string | null;
  latitude: number;
  longitude: number;

  constructor(props: Partial<SavedAddress> = {}) {
    this.id = props.id ?? 0;
    this.label = props.label ?? '';
    this.address = props.address ?? '';
    this.district = props.district ?? null;
    this.latitude = props.latitude ?? 0;
    this.longitude = props.longitude ?? 0;
  }
}
