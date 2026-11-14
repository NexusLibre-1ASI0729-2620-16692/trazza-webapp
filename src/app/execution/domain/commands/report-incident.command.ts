import {Incident, IncidentType} from '../model/incident.entity';

export class ReportIncidentCommand {
  readonly type: IncidentType;
  readonly description: string;

  constructor({ type, description }: { type: IncidentType; description: string }) {
    const text = (description ?? '').trim();
    if (!Incident.TYPES.includes(type)) throw new Error('validation.incident-type');
    if (!text) throw new Error('validation.description-required');
    this.type = type;
    this.description = text;
  }
}
