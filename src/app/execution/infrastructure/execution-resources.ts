import {TripProps} from '../domain/model/trip.entity';
import {TrackingPoint} from '../domain/model/tracking-point.entity';
import {Evidence, IncidentType} from '../domain/model/incident.entity';

export type TripResource = TripProps;

export type TrackingPointResource = TrackingPoint;

export interface DeviationAlertResource {
  id: number;
  latitude: number;
  longitude: number;
  deviationKm: number;
  detectedAt: string;
  acknowledgedAt: string | null;
}

export interface TrackingResultResource {
  point: TrackingPointResource;
  alert: DeviationAlertResource | null;
  tripStatus: string;
}

export interface IncidentResource {
  id: number;
  type: IncidentType;
  description: string;
  status: string;
  resolution: string | null;
  reportedAt: string;
  resolvedAt: string | null;
  evidences: Evidence[];
}
