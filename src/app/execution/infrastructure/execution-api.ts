import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PlatformApi} from '../../shared/infrastructure/platform-api';
import {DeviationAlertResource, IncidentResource, TrackingPointResource, TrackingResultResource, TripResource} from './execution-resources';
import {Trip} from '../domain/model/trip.entity';
import {TrackingPoint} from '../domain/model/tracking-point.entity';
import {DeviationAlert} from '../domain/model/deviation-alert.entity';
import {Incident, Evidence} from '../domain/model/incident.entity';
import {IotDevice} from '../domain/model/iot-device.entity';
import {TripStatusChange} from '../domain/model/trip-status-change.entity';
import {ReportIncidentCommand} from '../domain/commands/report-incident.command';

export type TripAction = 'pick-up' | 'deliver' | 'confirm';

export interface TrackingResult {
  point: TrackingPoint;
  alert: DeviationAlert | null;
  tripStatus: string;
}

@Injectable({providedIn: 'root'})
export class ExecutionApi extends PlatformApi {
  static readonly TRIPS_PATH = '/trips';
  static readonly IOT_DEVICES_PATH = '/iot-devices';

  listTrips(): Observable<Trip[]> {
    return this.get<TripResource[]>(ExecutionApi.TRIPS_PATH).pipe(map(items => items.map(item => new Trip(item))));
  }

  getTrip(id: string): Observable<Trip> {
    return this.get<TripResource>(`${ExecutionApi.TRIPS_PATH}/${id}`).pipe(map(item => new Trip(item)));
  }

  getHistory(id: string): Observable<TripStatusChange[]> {
    return this.get(`${ExecutionApi.TRIPS_PATH}/${id}/status-history`);
  }

  assignDriver(id: string, driverId: number | null): Observable<Trip> {
    return this.put<TripResource>(`${ExecutionApi.TRIPS_PATH}/${id}/driver`, { driverId }).pipe(map(item => new Trip(item)));
  }

  runAction(id: string, action: TripAction): Observable<Trip> {
    return this.post<TripResource>(`${ExecutionApi.TRIPS_PATH}/${id}/${action}`).pipe(map(item => new Trip(item)));
  }

  cancel(id: string, reason: string): Observable<Trip> {
    return this.post<TripResource>(`${ExecutionApi.TRIPS_PATH}/${id}/cancel`, { reason }).pipe(map(item => new Trip(item)));
  }

  listTrackingPoints(id: string): Observable<TrackingPoint[]> {
    return this.get<TrackingPointResource[]>(`${ExecutionApi.TRIPS_PATH}/${id}/tracking-points`);
  }

  recordTrackingPoint(id: string, point: { latitude: number; longitude: number; speedKmh: number | null }): Observable<TrackingResult> {
    return this.post<TrackingResultResource>(`${ExecutionApi.TRIPS_PATH}/${id}/tracking-points`, { ...point, source: 'PHONE' }).pipe(
      map(result => ({ point: result.point, alert: result.alert ? new DeviationAlert(result.alert) : null, tripStatus: result.tripStatus }))
    );
  }

  listAlerts(id: string): Observable<DeviationAlert[]> {
    return this.get<DeviationAlertResource[]>(`${ExecutionApi.TRIPS_PATH}/${id}/deviation-alerts`)
      .pipe(map(items => items.map(item => new DeviationAlert(item))));
  }

  acknowledgeAlert(id: string, alertId: number): Observable<unknown> {
    return this.post(`${ExecutionApi.TRIPS_PATH}/${id}/deviation-alerts/${alertId}/acknowledge`);
  }

  listIncidents(id: string): Observable<Incident[]> {
    return this.get<IncidentResource[]>(`${ExecutionApi.TRIPS_PATH}/${id}/incidents`).pipe(map(items => items.map(item => new Incident(item))));
  }

  reportIncident(id: string, command: ReportIncidentCommand): Observable<Incident> {
    return this.post<IncidentResource>(`${ExecutionApi.TRIPS_PATH}/${id}/incidents`, { ...command }).pipe(map(item => new Incident(item)));
  }

  addEvidence(id: string, incidentId: number, s3Key: string): Observable<Evidence> {
    return this.post(`${ExecutionApi.TRIPS_PATH}/${id}/incidents/${incidentId}/evidences`, { s3Key });
  }

  resolveIncident(id: string, incidentId: number, resolution: string): Observable<Incident> {
    return this.post<IncidentResource>(`${ExecutionApi.TRIPS_PATH}/${id}/incidents/${incidentId}/resolve`, { resolution })
      .pipe(map(item => new Incident(item)));
  }

  listIotDevices(): Observable<IotDevice[]> {
    return this.get(ExecutionApi.IOT_DEVICES_PATH);
  }
}
