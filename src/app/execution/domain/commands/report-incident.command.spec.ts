import {IncidentType} from '../model/incident.entity';
import {ReportIncidentCommand} from './report-incident.command';

describe('ReportIncidentCommand', () => {
  it('trims the description', () => {
    const command = new ReportIncidentCommand({ type: 'DAMAGED', description: '  Dos cajas llegaron rotas  ' });
    expect(command.type).toBe('DAMAGED');
    expect(command.description).toBe('Dos cajas llegaron rotas');
  });

  it('rejects a type that is not an incident type', () => {
    expect(() => new ReportIncidentCommand({ type: 'BROKEN' as IncidentType, description: 'Rota' }))
      .toThrowError('validation.incident-type');
  });

  it('rejects an empty description', () => {
    expect(() => new ReportIncidentCommand({ type: 'DELAY', description: '' })).toThrowError('validation.description-required');
  });

  it('rejects a description made only of spaces', () => {
    expect(() => new ReportIncidentCommand({ type: 'DELAY', description: '   ' })).toThrowError('validation.description-required');
  });
});
