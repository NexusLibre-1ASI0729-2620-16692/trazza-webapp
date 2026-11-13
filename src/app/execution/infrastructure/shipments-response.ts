import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {
  AddressResource,
  GeoLocationResource,
  MoneyResource
} from '../../shared/infrastructure/shared-resources';

export interface ShipmentEventResource {
  type: string;
  occurredAt: string;
  details: Record<string, unknown>;
}

export interface IncidentResource {
  id: number;
  type: string;
  description: string;
  reporterId: number;
  reporterRole: 'carrier' | 'merchant';
  reportedAt: string;
  status: 'open' | 'resolved';
}

export interface ShipmentResource extends BaseResource {
  id: number;
  code: string;

  proposalId: number;
  freightRequestId: number | null;
  returnRouteId: number | null;

  carrierId: number;
  carrierName: string;
  carrierPhone: string;
  vehicleLabel: string;

  merchantId: number;
  merchantName: string;
  merchantPhone: string;

  pickup: AddressResource;
  delivery: AddressResource;

  pickupDate: string;
  pickupWindow: string;

  cargoDescription: string;
  cargoType: string;
  weightKg: number;

  rate: MoneyResource;

  status: string;

  currentLocation: GeoLocationResource | null;

  events: ShipmentEventResource[];
  incidents: IncidentResource[];

  createdAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  closedAt: string | null;
}

export interface ShipmentsResponse extends BaseResponse {
  shipments: ShipmentResource[];
}
