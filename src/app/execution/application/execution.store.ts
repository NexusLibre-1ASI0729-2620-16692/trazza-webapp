import {computed, inject, Injectable, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {ExecutionApi, TrackingResult, TripAction} from '../infrastructure/execution-api';
import {Trip} from '../domain/model/trip.entity';
import {TrackingPoint} from '../domain/model/tracking-point.entity';
import {DeviationAlert} from '../domain/model/deviation-alert.entity';
import {Evidence, Incident} from '../domain/model/incident.entity';
import {IotDevice} from '../domain/model/iot-device.entity';
import {TripStatusChange} from '../domain/model/trip-status-change.entity';
import {ReportIncidentCommand} from '../domain/commands/report-incident.command';
import {upsertById} from '../../shared/application/collections';

/** Trips, their GPS tracking, deviation alerts and incidents, plus the carrier's loaned IoT devices. */
@Injectable({providedIn: 'root'})
export class ExecutionStore {
  private readonly api = inject(ExecutionApi);

  private readonly tripsSignal = signal<Trip[]>([]);
  private readonly iotDevicesSignal = signal<IotDevice[]>([]);
  private readonly loadedSignal = signal(false);

  readonly trips = this.tripsSignal.asReadonly();
  readonly iotDevices = this.iotDevicesSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();
  readonly activeTrips = computed(() => this.trips().filter(trip => trip.isActive));
  readonly openAlerts = computed(() => this.trips().reduce((total, trip) => total + (trip.openAlerts ?? 0), 0));

  async loadTrips(): Promise<void> {
    this.tripsSignal.set(await firstValueFrom(this.api.listTrips()));
    this.loadedSignal.set(true);
  }

  async getTrip(id: string): Promise<Trip> {
    return this.keep(await firstValueFrom(this.api.getTrip(id)));
  }

  getHistory(id: string): Promise<TripStatusChange[]> {
    return firstValueFrom(this.api.getHistory(id));
  }

  async assignDriver(trip: Trip, driverId: number | null): Promise<Trip> {
    return this.keep(await firstValueFrom(this.api.assignDriver(trip.id, driverId)));
  }

  async runAction(trip: Trip, action: TripAction): Promise<Trip> {
    return this.keep(await firstValueFrom(this.api.runAction(trip.id, action)));
  }

  async cancelTrip(trip: Trip, reason: string): Promise<Trip> {
    if (!reason.trim()) throw new Error('validation.reason-required');
    return this.keep(await firstValueFrom(this.api.cancel(trip.id, reason.trim())));
  }

  listTrackingPoints(tripId: string): Promise<TrackingPoint[]> {
    return firstValueFrom(this.api.listTrackingPoints(tripId));
  }

  recordTrackingPoint(tripId: string, point: { latitude: number; longitude: number; speedKmh: number | null }): Promise<TrackingResult> {
    return firstValueFrom(this.api.recordTrackingPoint(tripId, point));
  }

  listAlerts(tripId: string): Promise<DeviationAlert[]> {
    return firstValueFrom(this.api.listAlerts(tripId));
  }

  async acknowledgeAlert(tripId: string, alertId: number): Promise<void> {
    await firstValueFrom(this.api.acknowledgeAlert(tripId, alertId));
  }

  listIncidents(tripId: string): Promise<Incident[]> {
    return firstValueFrom(this.api.listIncidents(tripId));
  }

  reportIncident(tripId: string, command: ReportIncidentCommand): Promise<Incident> {
    return firstValueFrom(this.api.reportIncident(tripId, command));
  }

  addEvidence(tripId: string, incidentId: number, s3Key: string): Promise<Evidence> {
    if (!(s3Key ?? '').trim()) throw new Error('validation.evidence-required');
    return firstValueFrom(this.api.addEvidence(tripId, incidentId, s3Key.trim()));
  }

  resolveIncident(tripId: string, incidentId: number, resolution: string): Promise<Incident> {
    if (!(resolution ?? '').trim()) throw new Error('validation.resolution-required');
    return firstValueFrom(this.api.resolveIncident(tripId, incidentId, resolution.trim()));
  }

  async loadIotDevices(): Promise<void> {
    this.iotDevicesSignal.set(await firstValueFrom(this.api.listIotDevices()));
  }

  private keep(trip: Trip): Trip {
    this.tripsSignal.update(trips => trips.some(item => item.id === trip.id) ? upsertById(trips, trip) : [trip, ...trips]);
    return trip;
  }
}
