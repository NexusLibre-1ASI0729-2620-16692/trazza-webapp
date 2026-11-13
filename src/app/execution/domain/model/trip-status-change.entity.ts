export interface TripStatusChange {
  fromStatus: string | null;
  toStatus: string;
  changedAt: string;
}
