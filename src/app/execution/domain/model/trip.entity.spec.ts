import {Trip, TripProps} from './trip.entity';
import {TripStatus} from './trip-status.value-object';

const place = (address: string) => ({ address, latitude: -12.05, longitude: -77.04 });

const trip = (overrides: Partial<TripProps> = {}): Trip => new Trip({
  id: 'trip-1', status: TripStatus.SCHEDULED, myRole: 'CARRIER', agreedRate: 120, currency: 'PEN',
  matchProposalId: null, returnRouteId: null, shipmentRequestId: null, description: 'Cajas', weightKg: 100, volumeM3: 1,
  origin: place('Callao'), destination: place('Surco'), pickup: place('Lima'), delivery: place('San Borja'),
  departureAt: new Date(Date.now() + 3600000).toISOString(), carrier: { name: 'Luis', phone: null },
  merchant: { name: 'Ana', phone: null }, vehicle: { id: 'v-1', plate: 'T5K-123' }, driverId: null, driverName: null,
  lastPoint: null, openAlerts: 0, totalDistanceKm: null, pickedUpAt: null, deliveredAt: null, confirmedAt: null,
  cancelledAt: null, cancellationReason: null, createdAt: null, ...overrides
});

describe('Trip', () => {
  it('lets only the carrier pick up a scheduled trip', () => {
    expect(trip().canPickUp).toBeTrue();
    expect(trip({ myRole: 'MERCHANT' }).canPickUp).toBeFalse();
    expect(trip({ status: TripStatus.PICKED_UP }).canPickUp).toBeFalse();
  });

  it('lets the carrier deliver and track only while on the road', () => {
    const onTheRoad = trip({ status: TripStatus.IN_TRANSIT });
    expect(onTheRoad.canDeliver).toBeTrue();
    expect(onTheRoad.canTrack).toBeTrue();
    expect(trip().canDeliver).toBeFalse();
  });

  it('lets only the merchant confirm a delivered trip', () => {
    expect(trip({ status: TripStatus.DELIVERED, myRole: 'MERCHANT' }).canConfirm).toBeTrue();
    expect(trip({ status: TripStatus.DELIVERED }).canConfirm).toBeFalse();
  });

  it('warns the merchant about the compensation only after the departure time', () => {
    expect(trip({ myRole: 'MERCHANT' }).cancellationMayCauseCompensation).toBeFalse();
    const late = trip({ myRole: 'MERCHANT', departureAt: new Date(Date.now() - 60000).toISOString() });
    expect(late.cancellationMayCauseCompensation).toBeTrue();
  });

  it('shows the counterpart and the pick-up to delivery label', () => {
    expect(trip().counterpart.name).toBe('Ana');
    expect(trip({ myRole: 'MERCHANT' }).counterpart.name).toBe('Luis');
    expect(trip().label).toBe('Lima → San Borja');
  });
});
