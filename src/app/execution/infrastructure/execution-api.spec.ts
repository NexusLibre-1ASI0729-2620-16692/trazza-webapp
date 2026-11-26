import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {environment} from '../../../environments/environment';
import {ExecutionApi} from './execution-api';
import {TripResource} from './execution-resources';
import {Trip} from '../domain/model/trip.entity';
import {DeviationAlert} from '../domain/model/deviation-alert.entity';
import {Incident} from '../domain/model/incident.entity';
import {ReportIncidentCommand} from '../domain/commands/report-incident.command';
import {ApiError} from '../../shared/infrastructure/api-error';

const base = environment.platformProviderApiBaseUrl;
const place = (address: string) => ({ address, latitude: -12.05, longitude: -77.04 });

const tripResource = (id = 'trip-1'): TripResource => ({
  id, status: 'SCHEDULED', myRole: 'CARRIER', agreedRate: 120, currency: 'PEN', matchProposalId: null, returnRouteId: null,
  shipmentRequestId: null, description: 'Cajas', weightKg: 100, volumeM3: 1, origin: place('Callao'), destination: place('Surco'),
  pickup: place('Lima'), delivery: place('San Borja'), departureAt: '2026-11-12T15:00:00Z', carrier: { name: 'Luis', phone: null },
  merchant: { name: 'Ana', phone: null }, vehicle: { id: 'v-1', plate: 'T5K-123' }, driverId: null, driverName: null,
  lastPoint: null, openAlerts: 0, totalDistanceKm: null, pickedUpAt: null, deliveredAt: null, confirmedAt: null,
  cancelledAt: null, cancellationReason: null, createdAt: null
});

describe('ExecutionApi', () => {
  let api: ExecutionApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ExecutionApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists the trips of the signed-in user as Trip entities', () => {
    let trips: Trip[] = [];
    api.listTrips().subscribe(result => trips = result);
    const request = http.expectOne(`${base}/trips`);
    expect(request.request.method).toBe('GET');
    request.flush([tripResource('trip-1'), tripResource('trip-2')]);
    expect(trips.map(trip => trip.id)).toEqual(['trip-1', 'trip-2']);
    expect(trips[0]).toBeInstanceOf(Trip);
  });

  it('gets one trip and its status history', () => {
    let trip: Trip | undefined;
    api.getTrip('trip-1').subscribe(result => trip = result);
    http.expectOne(`${base}/trips/trip-1`).flush(tripResource());
    expect(trip?.label).toBe('Lima → San Borja');

    api.getHistory('trip-1').subscribe();
    http.expectOne(`${base}/trips/trip-1/status-history`).flush([]);
  });

  it('assigns a driver with PUT', () => {
    api.assignDriver('trip-1', 4).subscribe();
    const request = http.expectOne(`${base}/trips/trip-1/driver`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ driverId: 4 });
    request.flush(tripResource());
  });

  it('runs the pick-up, deliver and confirm actions with POST', () => {
    (['pick-up', 'deliver', 'confirm'] as const).forEach(action => {
      api.runAction('trip-1', action).subscribe();
      const request = http.expectOne(`${base}/trips/trip-1/${action}`);
      expect(request.request.method).toBe('POST');
      request.flush(tripResource());
    });
  });

  it('cancels a trip with the reason', () => {
    api.cancel('trip-1', 'Cliente ausente').subscribe();
    const request = http.expectOne(`${base}/trips/trip-1/cancel`);
    expect(request.request.body).toEqual({ reason: 'Cliente ausente' });
    request.flush(tripResource());
  });

  it('records a tracking point from the phone and maps the deviation alert', () => {
    let alert: DeviationAlert | null = null;
    api.recordTrackingPoint('trip-1', { latitude: -12.1, longitude: -77.0, speedKmh: 40 }).subscribe(result => alert = result.alert);
    const request = http.expectOne(`${base}/trips/trip-1/tracking-points`);
    expect(request.request.body).toEqual({ latitude: -12.1, longitude: -77.0, speedKmh: 40, source: 'PHONE' });
    request.flush({
      point: { id: 1, latitude: -12.1, longitude: -77.0, speedKmh: 40, source: 'PHONE', recordedAt: '2026-11-12T15:10:00Z' },
      alert: { id: 9, latitude: -12.1, longitude: -77.0, deviationKm: 2.6, detectedAt: '2026-11-12T15:10:00Z', acknowledgedAt: null },
      tripStatus: 'IN_TRANSIT'
    });
    expect(alert).toBeInstanceOf(DeviationAlert);
    expect((alert as unknown as DeviationAlert).isOpen).toBeTrue();
  });

  it('returns no alert when the point is on the route', () => {
    let alert: DeviationAlert | null | undefined;
    api.recordTrackingPoint('trip-1', { latitude: -12.1, longitude: -77.0, speedKmh: null }).subscribe(result => alert = result.alert);
    http.expectOne(`${base}/trips/trip-1/tracking-points`).flush({
      point: { id: 2, latitude: -12.1, longitude: -77.0, speedKmh: null, source: 'PHONE', recordedAt: '2026-11-12T15:11:00Z' },
      alert: null, tripStatus: 'IN_TRANSIT'
    });
    expect(alert).toBeNull();
  });

  it('acknowledges a deviation alert', () => {
    api.acknowledgeAlert('trip-1', 9).subscribe();
    const request = http.expectOne(`${base}/trips/trip-1/deviation-alerts/9/acknowledge`);
    expect(request.request.method).toBe('POST');
    request.flush({});
  });

  it('reports an incident and returns an Incident entity', () => {
    let incident: Incident | undefined;
    api.reportIncident('trip-1', new ReportIncidentCommand({ type: 'DAMAGED', description: 'Caja rota' })).subscribe(result => incident = result);
    const request = http.expectOne(`${base}/trips/trip-1/incidents`);
    expect(request.request.body).toEqual({ type: 'DAMAGED', description: 'Caja rota' });
    request.flush({ id: 3, type: 'DAMAGED', description: 'Caja rota', status: 'OPEN', resolution: null, reportedAt: '2026-11-12T16:00:00Z', resolvedAt: null, evidences: [] });
    expect(incident).toBeInstanceOf(Incident);
    expect(incident?.isResolved).toBeFalse();
  });

  it('adds an evidence and resolves an incident', () => {
    api.addEvidence('trip-1', 3, 'incidents/3/photo.jpg').subscribe();
    const evidence = http.expectOne(`${base}/trips/trip-1/incidents/3/evidences`);
    expect(evidence.request.body).toEqual({ s3Key: 'incidents/3/photo.jpg' });
    evidence.flush({});

    api.resolveIncident('trip-1', 3, 'Se repuso la carga').subscribe();
    const resolve = http.expectOne(`${base}/trips/trip-1/incidents/3/resolve`);
    expect(resolve.request.body).toEqual({ resolution: 'Se repuso la carga' });
    resolve.flush({ id: 3, type: 'DAMAGED', description: 'Caja rota', status: 'RESOLVED', resolution: 'Se repuso la carga', reportedAt: '2026-11-12T16:00:00Z', resolvedAt: '2026-11-12T17:00:00Z', evidences: [] });
  });

  it('lists the loaned IoT devices', () => {
    api.listIotDevices().subscribe();
    http.expectOne(`${base}/iot-devices`).flush([]);
  });

  it('turns an HTTP failure into an ApiError that keeps the problem code', () => {
    let error: unknown;
    api.listTrips().subscribe({ error: failure => error = failure });
    http.expectOne(`${base}/trips`).flush({ code: 'TRIP_NOT_FOUND', detail: 'No trip' }, { status: 404, statusText: 'Not Found' });
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).code).toBe('TRIP_NOT_FOUND');
  });
});
