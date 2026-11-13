import {PartyResource, PlaceResource} from '../../shared/infrastructure/shared-resources';

export interface ReturnRouteResource {
  id: string;
  origin: PlaceResource;
  destination: PlaceResource;
  departureAt: string;
  maxShipments: number;
  status: string;
  vehicle: { id: string; plate: string; model: string };
  driverId: number | null;
  driverName: string | null;
  acceptedShipments: number;
  availableWeightKg: number;
  availableVolumeM3: number;
  pendingProposals: number;
  createdAt: string | null;
}

export interface ShipmentRequestResource {
  id: string;
  description: string;
  weightKg: number;
  volumeM3: number;
  pickup: PlaceResource;
  delivery: PlaceResource;
  pickupFrom: string;
  pickupUntil: string;
  status: string;
  merchantName: string;
  pendingProposals: number;
  cancellationReason: string | null;
  cancelledAt: string | null;
  createdAt: string | null;
}

export interface MatchProposalResource {
  id: string;
  offeredRate: number;
  currency: string;
  status: string;
  respondedAt: string | null;
  createdAt: string | null;
  route: ReturnRouteResource;
  shipment: ShipmentRequestResource;
  carrier: PartyResource;
  merchant: PartyResource;
  tripId: string | null;
}

export interface MessageResource {
  id: number;
  senderId: string;
  senderName: string;
  isMine: boolean;
  content: string;
  sentAt: string;
  readAt: string | null;
}
