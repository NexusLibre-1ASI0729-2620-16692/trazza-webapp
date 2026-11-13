import {IncidentType} from './incident-type.value-object';

export type ReporterRole =
  'carrier' | 'merchant';

export type IncidentStatus =
  'open' | 'resolved';

export interface IncidentParams {
  id?: number | null;
  type: IncidentType;
  description: string;
  reporterId: number;
  reporterRole: ReporterRole;
  reportedAt?: string;
  status?: IncidentStatus;
}

export class Incident {
  static readonly MIN_DESCRIPTION_LENGTH = 10;
  static readonly MAX_DESCRIPTION_LENGTH = 500;

  #id: number | null;
  readonly #type: IncidentType;
  readonly #description: string;
  readonly #reporterId: number;
  readonly #reporterRole: ReporterRole;
  readonly #reportedAt: string;
  #status: IncidentStatus;

  constructor({
                id = null,
                type,
                description,
                reporterId,
                reporterRole,
                reportedAt,
                status = 'open'
              }: IncidentParams) {

    if (!(type instanceof IncidentType)) {
      throw new Error(
        'validation.incident-type-invalid'
      );
    }

    const text = (description ?? '').trim();

    if (
      text.length <
      Incident.MIN_DESCRIPTION_LENGTH
    ) {
      throw new Error(
        'validation.incident-description-short'
      );
    }

    if (
      text.length >
      Incident.MAX_DESCRIPTION_LENGTH
    ) {
      throw new Error(
        'validation.description-too-long'
      );
    }

    if (
      reporterId === null ||
      reporterId === undefined
    ) {
      throw new Error(
        'validation.user-required'
      );
    }

    if (
      !['carrier', 'merchant']
        .includes(reporterRole)
    ) {
      throw new Error(
        'validation.party-invalid'
      );
    }

    if (
      !['open', 'resolved']
        .includes(status)
    ) {
      throw new Error(
        'validation.status-invalid'
      );
    }

    this.#id = id;
    this.#type = type;
    this.#description = text;
    this.#reporterId = reporterId;
    this.#reporterRole = reporterRole;
    this.#reportedAt =
      reportedAt ??
      new Date().toISOString();
    this.#status = status;
  }

  get id(): number | null {
    return this.#id;
  }

  get type(): IncidentType {
    return this.#type;
  }

  get description(): string {
    return this.#description;
  }

  get reporterId(): number {
    return this.#reporterId;
  }

  get reporterRole(): ReporterRole {
    return this.#reporterRole;
  }

  get reportedAt(): string {
    return this.#reportedAt;
  }

  get status(): IncidentStatus {
    return this.#status;
  }

  assignId(id: number): void {
    this.#id = id;
  }

  resolve(): void {
    if (this.#status === 'resolved') {
      throw new Error(
        'validation.incident-already-resolved'
      );
    }

    this.#status = 'resolved';
  }
}
