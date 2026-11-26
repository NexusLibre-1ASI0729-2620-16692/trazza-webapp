import {Evidence, Incident} from './incident.entity';

const incident = (overrides: Partial<ConstructorParameters<typeof Incident>[0]> = {}) => new Incident({
  id: 3, type: 'DAMAGED', description: 'Caja rota', status: 'OPEN', reportedAt: '2026-11-12T10:00:00Z', ...overrides
});

describe('Incident', () => {
  it('knows the four types of incident the carrier or the merchant can report', () => {
    expect(Incident.TYPES).toEqual(['DAMAGED', 'INCOMPLETE', 'DELAY', 'OTHER']);
  });

  it('is open until the platform marks it as resolved', () => {
    expect(incident().isResolved).toBeFalse();
    expect(incident({ status: 'IN_REVIEW' }).isResolved).toBeFalse();
    expect(incident({ status: 'RESOLVED' }).isResolved).toBeTrue();
  });

  it('starts without resolution, resolution date or evidences', () => {
    const reported = incident();
    expect(reported.resolution).toBeNull();
    expect(reported.resolvedAt).toBeNull();
    expect(reported.evidences).toEqual([]);
  });

  it('keeps its own copy of the evidences', () => {
    const evidences: Evidence[] = [{ id: 1, s3Key: 'incidents/3/photo-1.jpg', uploadedAt: '2026-11-12T10:10:00Z' }];
    const reported = incident({ evidences });
    evidences.push({ id: 2, s3Key: 'incidents/3/photo-2.jpg', uploadedAt: '2026-11-12T10:11:00Z' });
    expect(reported.evidences.length).toBe(1);
  });
});
