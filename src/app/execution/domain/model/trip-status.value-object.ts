export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export const ACTIVE_TRIP_STATUSES: readonly string[] = Object.freeze([
  TripStatus.SCHEDULED, TripStatus.PICKED_UP, TripStatus.IN_TRANSIT, TripStatus.DELIVERED
]);
