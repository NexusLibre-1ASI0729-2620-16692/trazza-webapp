import {assertPlace, Place} from '../../../shared/domain/model/place.value-object';
import {ReturnRoute} from '../model/return-route.entity';

export class CreateReturnRouteCommand {
  readonly vehicleId: string;
  readonly driverId: number | null;
  readonly origin: Place;
  readonly destination: Place;
  readonly departureAt: string;
  readonly maxShipments: number;

  constructor(props: {
    vehicleId: string | null; driverId: number | null; origin: Place; destination: Place; departureAt: Date | null; maxShipments: number;
  }) {
    if (!props.vehicleId) throw new Error('validation.vehicle-required');
    if (!props.departureAt || Number.isNaN(props.departureAt.getTime()) || props.departureAt <= new Date())
      throw new Error('validation.departure-future');
    if (![1, ReturnRoute.MAX_SHIPMENTS].includes(props.maxShipments)) throw new Error('validation.max-shipments');
    this.vehicleId = props.vehicleId;
    this.driverId = props.driverId || null;
    this.origin = CreateReturnRouteCommand.place(props.origin);
    this.destination = CreateReturnRouteCommand.place(props.destination);
    this.departureAt = props.departureAt.toISOString();
    this.maxShipments = props.maxShipments;
  }

  static place(place: Place): Place {
    if (place.latitude === null || place.latitude === undefined) {
      if (!place.address?.trim()) throw new Error('validation.address-required');
      throw new Error('validation.point-required');
    }
    return assertPlace(place);
  }
}
