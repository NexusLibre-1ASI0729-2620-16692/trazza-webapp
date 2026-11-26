import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {ExecutionStore} from './execution.store';
import {ExecutionApi} from '../infrastructure/execution-api';
import {Trip, TripProps} from '../domain/model/trip.entity';
import {TripStatus} from '../domain/model/trip-status.value-object';
import {IotDevice} from '../domain/model/iot-device.entity';

const place = (address: string) => ({ address, latitude: -12.05, longitude: -77.04 });

const trip = (id: string, overrides: Partial<TripProps> = {}): Trip => new Trip({
  id, status: TripStatus.SCHEDULED, myRole: 'CARRIER', agreedRate: 120, currency: 'PEN',
  matchProposalId: null, returnRouteId: null, shipmentRequestId: null, description: 'Cajas', weightKg: 100, volumeM3: 1,
  origin: place('Callao'), destination: place('Surco'), pickup: place('Lima'), delivery: place('San Borja'),
  departureAt: '2026-11-12T15:00:00Z', carrier: { name: 'Luis', phone: null }, merchant: { name: 'Ana', phone: null },
  vehicle: { id: 'v-1', plate: 'T5K-123' }, driverId: null, driverName: null, lastPoint: null, openAlerts: 0,
  totalDistanceKm: null, pickedUpAt: null, deliveredAt: null, confirmedAt: null, cancelledAt: null,
  cancellationReason: null, createdAt: null, ...overrides
});

describe('ExecutionStore', () => {
  let store: ExecutionStore;
  let api: jasmine.SpyObj<ExecutionApi>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ExecutionApi>('ExecutionApi', [
      'listTrips', 'getTrip', 'runAction', 'cancel', 'addEvidence', 'resolveIncident', 'listIotDevices'
    ]);
    TestBed.configureTestingModule({ providers: [{ provide: ExecutionApi, useValue: api }] });
    store = TestBed.inject(ExecutionStore);
  });

  it('starts empty and not loaded', () => {
    expect(store.trips()).toEqual([]);
    expect(store.loaded()).toBeFalse();
  });

  it('loads the trips and marks the store as loaded', async () => {
    api.listTrips.and.returnValue(of([trip('a'), trip('b')]));
    await store.loadTrips();
    expect(store.trips().map(item => item.id)).toEqual(['a', 'b']);
    expect(store.loaded()).toBeTrue();
  });

  it('keeps only the trips that have not been closed as active', async () => {
    api.listTrips.and.returnValue(of([
      trip('a'), trip('b', { status: TripStatus.DELIVERED }), trip('c', { status: TripStatus.CONFIRMED }),
      trip('d', { status: TripStatus.CANCELLED })
    ]));
    await store.loadTrips();
    expect(store.activeTrips().map(item => item.id)).toEqual(['a', 'b']);
  });

  it('adds up the open deviation alerts of every trip', async () => {
    api.listTrips.and.returnValue(of([trip('a', { openAlerts: 2 }), trip('b', { openAlerts: 1 }), trip('c')]));
    await store.loadTrips();
    expect(store.openAlerts()).toBe(3);
  });

  it('replaces a trip with the instance returned after an action', async () => {
    api.listTrips.and.returnValue(of([trip('a'), trip('b')]));
    await store.loadTrips();
    api.runAction.and.returnValue(of(trip('a', { status: TripStatus.PICKED_UP })));
    const updated = await store.runAction(store.trips()[0], 'pick-up');
    expect(updated.status).toBe(TripStatus.PICKED_UP);
    expect(store.trips().map(item => item.status)).toEqual([TripStatus.PICKED_UP, TripStatus.SCHEDULED]);
    expect(api.runAction).toHaveBeenCalledWith('a', 'pick-up');
  });

  it('puts a trip that was not loaded yet at the top of the list', async () => {
    api.listTrips.and.returnValue(of([trip('a')]));
    await store.loadTrips();
    api.getTrip.and.returnValue(of(trip('z')));
    await store.getTrip('z');
    expect(store.trips().map(item => item.id)).toEqual(['z', 'a']);
  });

  it('cancels a trip with the trimmed reason', async () => {
    api.cancel.and.returnValue(of(trip('a', { status: TripStatus.CANCELLED })));
    await store.cancelTrip(trip('a'), '  Cliente ausente ');
    expect(api.cancel).toHaveBeenCalledWith('a', 'Cliente ausente');
  });

  it('does not call the API to cancel a trip without a reason', async () => {
    await expectAsync(store.cancelTrip(trip('a'), '   ')).toBeRejectedWithError('validation.reason-required');
    expect(api.cancel).not.toHaveBeenCalled();
  });

  it('requires an evidence key and a resolution before calling the API', () => {
    expect(() => store.addEvidence('a', 1, ' ')).toThrowError('validation.evidence-required');
    expect(() => store.resolveIncident('a', 1, '')).toThrowError('validation.resolution-required');
    expect(api.addEvidence).not.toHaveBeenCalled();
    expect(api.resolveIncident).not.toHaveBeenCalled();
  });

  it('loads the IoT devices of the carrier', async () => {
    const devices: IotDevice[] = [{ id: 1, serialNumber: 'TRZ-001', status: 'LOANED', vehicleId: 'v-1', vehiclePlate: 'T5K-123', loanedAt: '2026-11-01' }];
    api.listIotDevices.and.returnValue(of(devices));
    await store.loadIotDevices();
    expect(store.iotDevices()).toEqual(devices);
  });
});
