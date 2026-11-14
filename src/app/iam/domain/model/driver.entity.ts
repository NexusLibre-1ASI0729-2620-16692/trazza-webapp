import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type DriverSex = 'F' | 'M' | 'X';

export class Driver implements BaseEntity {
  id: number;
  fullName: string;
  sex: DriverSex | null;
  experienceStars: number;
  isActive: boolean;

  constructor(props: Partial<Driver> = {}) {
    this.id = props.id ?? 0;
    this.fullName = props.fullName ?? '';
    this.sex = props.sex ?? null;
    this.experienceStars = props.experienceStars ?? 3;
    this.isActive = props.isActive ?? true;
  }
}
