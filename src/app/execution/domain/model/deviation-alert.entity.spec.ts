import {DeviationAlert} from './deviation-alert.entity';

const alert = (acknowledgedAt?: string | null) => new DeviationAlert({
  id: 7, latitude: -12.05, longitude: -77.04, deviationKm: 2.4, detectedAt: '2026-11-12T10:00:00Z', acknowledgedAt
});

describe('DeviationAlert', () => {
  it('is open while nobody has acknowledged it', () => {
    expect(alert().isOpen).toBeTrue();
    expect(alert().acknowledgedAt).toBeNull();
  });

  it('is closed once it has been acknowledged', () => {
    expect(alert('2026-11-12T10:05:00Z').isOpen).toBeFalse();
  });

  it('keeps the position and the distance reported by the platform', () => {
    const detected = alert();
    expect(detected.id).toBe(7);
    expect(detected.latitude).toBe(-12.05);
    expect(detected.longitude).toBe(-77.04);
    expect(detected.deviationKm).toBe(2.4);
    expect(detected.detectedAt).toBe('2026-11-12T10:00:00Z');
  });
});
