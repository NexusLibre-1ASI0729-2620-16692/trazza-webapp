import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type IncidentType = 'DAMAGED' | 'INCOMPLETE' | 'DELAY' | 'OTHER';

export interface Evidence {
  id: number;
  s3Key: string;
  uploadedAt: string;
}

/** A problem reported on a trip (damaged or incomplete cargo, delay...). Evidence files are referenced by key. */
export class Incident implements BaseEntity {
  static readonly TYPES: readonly IncidentType[] = Object.freeze(['DAMAGED', 'INCOMPLETE', 'DELAY', 'OTHER'] as IncidentType[]);

  id: number;
  type: IncidentType;
  description: string;
  status: string;
  resolution: string | null;
  reportedAt: string;
  resolvedAt: string | null;
  evidences: Evidence[];

  constructor(props: {
    id: number; type: IncidentType; description: string; status: string; resolution?: string | null; reportedAt: string;
    resolvedAt?: string | null; evidences?: Evidence[];
  }) {
    this.id = props.id;
    this.type = props.type;
    this.description = props.description;
    this.status = props.status;
    this.resolution = props.resolution ?? null;
    this.reportedAt = props.reportedAt;
    this.resolvedAt = props.resolvedAt ?? null;
    this.evidences = [...(props.evidences ?? [])];
  }

  get isResolved(): boolean {
    return this.status === 'RESOLVED';
  }
}
