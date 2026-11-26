import {ComponentFixture, TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {provideRouter, Router} from '@angular/router';
import {provideTranslateService} from '@ngx-translate/core';
import {TripList} from './trip-list';
import {ExecutionStore} from '../../../application/execution.store';
import {Trip, TripProps} from '../../../domain/model/trip.entity';
import {TripStatus} from '../../../domain/model/trip-status.value-object';

const place = (address: string) => ({ address, latitude: -12.05, longitude: -77.04 });

const trip = (id: string, status: string): Trip => new Trip({
  id, status, myRole: 'CARRIER', agreedRate: 120, currency: 'PEN', matchProposalId: null, returnRouteId: null,
  shipmentRequestId: null, description: 'Cajas', weightKg: 100, volumeM3: 1, origin: place('Callao'),
  destination: place('Surco'), pickup: place('Lima'), delivery: place('San Borja'), departureAt: '2026-11-12T15:00:00Z',
  carrier: { name: 'Luis', phone: null }, merchant: { name: 'Ana', phone: null }, vehicle: { id: 'v-1', plate: 'T5K-123' },
  driverId: null, driverName: null, lastPoint: null, openAlerts: 0, totalDistanceKm: null, pickedUpAt: null,
  deliveredAt: null, confirmedAt: null, cancelledAt: null, cancellationReason: null, createdAt: null
} as TripProps);

describe('TripList', () => {
  let fixture: ComponentFixture<TripList>;
  const trips = signal<Trip[]>([]);
  const loaded = signal(false);
  const store = { trips, loaded, loadTrips: jasmine.createSpy('loadTrips') };

  const rows = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('tr[mat-row]'));
  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    trips.set([]);
    loaded.set(false);
    store.loadTrips.calls.reset();
    store.loadTrips.and.resolveTo();
    await TestBed.configureTestingModule({
      imports: [TripList],
      providers: [{ provide: ExecutionStore, useValue: store }, provideRouter([]), provideTranslateService()]
    }).compileComponents();
    fixture = TestBed.createComponent(TripList);
  });

  it('asks the store for the trips when it opens', async () => {
    await render();
    expect(store.loadTrips).toHaveBeenCalledTimes(1);
  });

  it('shows the active trips by default', async () => {
    trips.set([trip('a', TripStatus.SCHEDULED), trip('b', TripStatus.CONFIRMED), trip('c', TripStatus.IN_TRANSIT)]);
    loaded.set(true);
    await render();
    expect(rows().length).toBe(2);
  });

  it('can show the closed trips or all of them', async () => {
    trips.set([trip('a', TripStatus.SCHEDULED), trip('b', TripStatus.CONFIRMED), trip('c', TripStatus.CANCELLED)]);
    loaded.set(true);
    await render();
    const filter = (fixture.componentInstance as unknown as { filter: { set(value: string): void } }).filter;

    filter.set('closed');
    await render();
    expect(rows().length).toBe(2);

    filter.set('all');
    await render();
    expect(rows().length).toBe(3);
  });

  it('shows the empty state once it has loaded and there are no trips', async () => {
    loaded.set(true);
    await render();
    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
    expect(rows().length).toBe(0);
  });

  it('does not show the empty state while the trips are still loading', async () => {
    await render();
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('opens the trip detail when a row is clicked', async () => {
    trips.set([trip('trip-1', TripStatus.SCHEDULED)]);
    loaded.set(true);
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    await render();
    rows()[0].click();
    expect(navigate).toHaveBeenCalledWith(['/execution/trips', 'trip-1']);
  });
});
