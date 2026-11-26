import {ACTIVE_TRIP_STATUSES, TripStatus} from './trip-status.value-object';

describe('TripStatus', () => {
  it('exposes the six states of the trip life cycle', () => {
    expect(Object.values(TripStatus) as string[]).toEqual([
      'SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED', 'CANCELLED'
    ]);
  });

  it('keeps a trip active until the merchant confirms it or it is cancelled', () => {
    expect(ACTIVE_TRIP_STATUSES).toEqual([
      TripStatus.SCHEDULED, TripStatus.PICKED_UP, TripStatus.IN_TRANSIT, TripStatus.DELIVERED
    ]);
    expect(ACTIVE_TRIP_STATUSES).not.toContain(TripStatus.CONFIRMED);
    expect(ACTIVE_TRIP_STATUSES).not.toContain(TripStatus.CANCELLED);
  });

  it('freezes the list of active statuses', () => {
    expect(Object.isFrozen(ACTIVE_TRIP_STATUSES)).toBeTrue();
  });
});
