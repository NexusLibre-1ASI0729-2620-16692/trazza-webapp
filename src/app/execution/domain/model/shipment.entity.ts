import {Address} from '../../../shared/domain/model/address.value-object';
import {Money} from '../../../shared/domain/model/money.value-object';
import {GeoLocation} from '../../../shared/domain/model/geo-location.value-object';
import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Incident} from './incident.entity';
import {ShipmentStatus} from './shipment-status.value-object';

export interface ShipmentEvent {
  type: string;
  occurredAt: string;
  details: Record<string, unknown>;
}

export interface ShipmentParams {
  id?: number;
  code?: string;

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

  pickup: Address;
  delivery: Address;

  pickupDate: string;
  pickupWindow: string;

  cargoDescription: string;
  cargoType: string;
  weightKg: number;

  rate: Money;

  status?: ShipmentStatus | string;

  currentLocation?: GeoLocation | null;

  events?: ShipmentEvent[];
  incidents?: Incident[];

  createdAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  closedAt?: string | null;
}

export interface OpenShipmentData {
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

  pickup: Address;
  delivery: Address;

  pickupDate: string;
  pickupWindow: string;

  cargoDescription: string;
  cargoType: string;
  weightKg: number;

  rate: Money;
}

export class Shipment implements BaseEntity {

  static readonly DEVIATION_THRESHOLD_KM = 2;
  static readonly DELIVERY_RADIUS_KM = 1;
  static readonly INCIDENT_WINDOW_HOURS = 48;
  static readonly AVERAGE_SPEED_KMH = 30;

  readonly id: number;

  #code: string;

  readonly #proposalId: number;
  readonly #freightRequestId: number | null;
  readonly #returnRouteId: number | null;

  readonly #carrierId: number;
  readonly #carrierName: string;
  readonly #carrierPhone: string;
  readonly #vehicleLabel: string;

  readonly #merchantId: number;
  readonly #merchantName: string;
  readonly #merchantPhone: string;

  readonly #pickup: Address;
  readonly #delivery: Address;

  readonly #pickupDate: string;
  readonly #pickupWindow: string;

  readonly #cargoDescription: string;
  readonly #cargoType: string;
  readonly #weightKg: number;

  readonly #rate: Money;

  #status: ShipmentStatus;

  #currentLocation: GeoLocation | null;

  #events: ShipmentEvent[];
  #incidents: Incident[];

  #createdAt: string | null;
  #pickedUpAt: string | null;
  #deliveredAt: string | null;
  #closedAt: string | null;

  constructor({
                id = 0,
                code = '',
                proposalId,
                freightRequestId,
                returnRouteId,
                carrierId,
                carrierName,
                carrierPhone,
                vehicleLabel,
                merchantId,
                merchantName,
                merchantPhone,
                pickup,
                delivery,
                pickupDate,
                pickupWindow,
                cargoDescription,
                cargoType,
                weightKg,
                rate,
                status = ShipmentStatus.MATCHED,
                currentLocation = null,
                events = [],
                incidents = [],
                createdAt = null,
                pickedUpAt = null,
                deliveredAt = null,
                closedAt = null
              }: ShipmentParams) {

    if (proposalId === null || proposalId === undefined) {
      throw new Error('validation.proposal-required');
    }

    if (carrierId === null || carrierId === undefined) {
      throw new Error('validation.user-required');
    }

    if (merchantId === null || merchantId === undefined) {
      throw new Error('validation.user-required');
    }

    if (!(pickup instanceof Address)) {
      throw new Error('validation.address-required');
    }

    if (!(delivery instanceof Address)) {
      throw new Error('validation.address-required');
    }

    if (!(rate instanceof Money)) {
      throw new Error('validation.money-invalid');
    }

    if (!(status instanceof ShipmentStatus)) {
      status = new ShipmentStatus(status);
    }

    if (!Number.isFinite(weightKg) || weightKg < 0) {
      throw new Error('validation.weight-invalid');
    }

    this.id = id;
    this.#code = code;

    this.#proposalId = proposalId;
    this.#freightRequestId = freightRequestId;
    this.#returnRouteId = returnRouteId;

    this.#carrierId = carrierId;
    this.#carrierName = carrierName;
    this.#carrierPhone = carrierPhone;
    this.#vehicleLabel = vehicleLabel;

    this.#merchantId = merchantId;
    this.#merchantName = merchantName;
    this.#merchantPhone = merchantPhone;

    this.#pickup = pickup;
    this.#delivery = delivery;

    this.#pickupDate = pickupDate;
    this.#pickupWindow = pickupWindow;

    this.#cargoDescription = cargoDescription;
    this.#cargoType = cargoType;
    this.#weightKg = weightKg;

    this.#rate = rate;

    this.#status = status;

    this.#currentLocation = currentLocation;

    this.#events = [...events];
    this.#incidents = [...incidents];

    this.#createdAt = createdAt;
    this.#pickedUpAt = pickedUpAt;
    this.#deliveredAt = deliveredAt;
    this.#closedAt = closedAt;
  }

  static open(data: OpenShipmentData): Shipment {
    const now = new Date().toISOString();

    const shipment = new Shipment({
      ...data,
      id: 0,
      status: ShipmentStatus.MATCHED,
      currentLocation: data.pickup.location,
      events: [
        {
          type: ShipmentStatus.MATCHED,
          occurredAt: now,
          details: {}
        }
      ],
      incidents: [],
      createdAt: now,
      pickedUpAt: null,
      deliveredAt: null,
      closedAt: null
    });

    return shipment;
  }

  get code(): string {
    return this.#code;
  }

  get proposalId(): number {
    return this.#proposalId;
  }

  get freightRequestId(): number | null {
    return this.#freightRequestId;
  }

  get returnRouteId(): number | null {
    return this.#returnRouteId;
  }

  get carrierId(): number {
    return this.#carrierId;
  }

  get carrierName(): string {
    return this.#carrierName;
  }

  get carrierPhone(): string {
    return this.#carrierPhone;
  }

  get vehicleLabel(): string {
    return this.#vehicleLabel;
  }

  get merchantId(): number {
    return this.#merchantId;
  }

  get merchantName(): string {
    return this.#merchantName;
  }

  get merchantPhone(): string {
    return this.#merchantPhone;
  }

  get pickup(): Address {
    return this.#pickup;
  }

  get delivery(): Address {
    return this.#delivery;
  }

  get pickupDate(): string {
    return this.#pickupDate;
  }

  get pickupWindow(): string {
    return this.#pickupWindow;
  }

  get cargoDescription(): string {
    return this.#cargoDescription;
  }

  get cargoType(): string {
    return this.#cargoType;
  }

  get weightKg(): number {
    return this.#weightKg;
  }

  get rate(): Money {
    return this.#rate;
  }

  get status(): ShipmentStatus {
    return this.#status;
  }

  get currentLocation(): GeoLocation | null {
    return this.#currentLocation;
  }

  get events(): ShipmentEvent[] {
    return [...this.#events];
  }

  get incidents(): Incident[] {
    return [...this.#incidents];
  }

  get createdAt(): string | null {
    return this.#createdAt;
  }

  get pickedUpAt(): string | null {
    return this.#pickedUpAt;
  }

  get deliveredAt(): string | null {
    return this.#deliveredAt;
  }

  get closedAt(): string | null {
    return this.#closedAt;
  }

  get label(): string {
    return this.#code || `Shipment #${this.id}`;
  }

  get deviationKm(): number {
    if (!this.#currentLocation) {
      return 0;
    }

    return this.#currentLocation.distanceToSegment(
      this.#pickup.location,
      this.#delivery.location
    );
  }

  get isOffRoute(): boolean {
    return this.deviationKm > Shipment.DEVIATION_THRESHOLD_KM;
  }

  get distanceToDeliveryKm(): number {
    if (!this.#currentLocation) {
      return 0;
    }

    return this.#currentLocation.distanceTo(
      this.#delivery.location
    );
  }

  get etaMinutes(): number {
    const distance = this.distanceToDeliveryKm;

    if (distance <= 0) {
      return 0;
    }

    return Math.ceil(
      (distance / Shipment.AVERAGE_SPEED_KMH) * 60
    );
  }

  involves(userId: number): boolean {
    return (
      this.#carrierId === userId ||
      this.#merchantId === userId
    );
  }

  confirmPickup(): void {
    if (this.#status.value !== ShipmentStatus.MATCHED) {
      throw new Error('validation.pickup-not-allowed');
    }

    const now = new Date().toISOString();

    this.#status = new ShipmentStatus(
      ShipmentStatus.PICKED_UP
    );

    this.#currentLocation = this.#pickup.location;
    this.#pickedUpAt = now;

    this.#events.push({
      type: ShipmentStatus.PICKED_UP,
      occurredAt: now,
      details: {
        district: this.#pickup.district
      }
    });
  }

  updateLocation(location: GeoLocation): void {
    if (!this.#status.isMoving) {
      throw new Error('validation.location-update-not-allowed');
    }

    this.#currentLocation = location;

    this.#events.push({
      type: 'location_updated',
      occurredAt: new Date().toISOString(),
      details: {
        latitude: location.latitude,
        longitude: location.longitude,
        deviationKm: this.deviationKm,
        offRoute: this.isOffRoute
      }
    });
  }

  confirmDelivery(
    acknowledgeDistance = false
  ): void {

    if (!this.#status.isMoving) {
      throw new Error('validation.delivery-not-allowed');
    }

    const distance = this.distanceToDeliveryKm;

    if (
      distance > Shipment.DELIVERY_RADIUS_KM &&
      !acknowledgeDistance
    ) {
      throw new Error(
        'validation.delivery-location-too-far'
      );
    }

    const now = new Date().toISOString();

    this.#status = new ShipmentStatus(
      ShipmentStatus.DELIVERED
    );

    this.#currentLocation = this.#delivery.location;
    this.#deliveredAt = now;

    this.#events.push({
      type: ShipmentStatus.DELIVERED,
      occurredAt: now,
      details: {
        distanceToDeliveryKm: distance
      }
    });
  }

  confirmReception(): void {
    if (this.#status.value !== ShipmentStatus.DELIVERED) {
      throw new Error(
        'validation.reception-not-allowed'
      );
    }

    const now = new Date().toISOString();

    this.#status = new ShipmentStatus(
      ShipmentStatus.CLOSED
    );

    this.#closedAt = now;

    this.#events.push({
      type: ShipmentStatus.CLOSED,
      occurredAt: now,
      details: {}
    });
  }

  cancel(): void {
    if (this.#status.isDelivered) {
      throw new Error(
        'validation.shipment-already-delivered'
      );
    }

    if (this.#status.value === ShipmentStatus.CANCELLED) {
      throw new Error(
        'validation.shipment-already-cancelled'
      );
    }

    const now = new Date().toISOString();

    this.#status = new ShipmentStatus(
      ShipmentStatus.CANCELLED
    );

    this.#events.push({
      type: ShipmentStatus.CANCELLED,
      occurredAt: now,
      details: {}
    });
  }

  reportIncident(incident: Incident): void {
    if (!(incident instanceof Incident)) {
      throw new Error(
        'validation.incident-type-invalid'
      );
    }

    if (!this.canReportIncident()) {
      throw new Error(
        'validation.incident-window-closed'
      );
    }

    if (
      !incident.reporterId ||
      !this.involves(incident.reporterId)
    ) {
      throw new Error(
        'validation.incident-reporter-invalid'
      );
    }

    this.#incidents.push(incident);
  }

  canReportIncident(): boolean {
    if (
      this.#status.isActive
    ) {
      return true;
    }

    const referenceDate =
      this.#deliveredAt ??
      this.#closedAt;

    if (!referenceDate) {
      return false;
    }

    const elapsed =
      Date.now() -
      new Date(referenceDate).getTime();

    const hours =
      elapsed / (1000 * 60 * 60);

    return hours <= Shipment.INCIDENT_WINDOW_HOURS;
  }
}
