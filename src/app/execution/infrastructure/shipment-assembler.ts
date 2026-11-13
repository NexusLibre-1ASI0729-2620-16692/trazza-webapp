import {Shipment} from '../domain/model/shipment.entity';
import {ShipmentStatus} from '../domain/model/shipment-status.value-object';
import {SharedAssembler} from '../../shared/infrastructure/shared-assembler';
import {
  ShipmentResource,
  ShipmentsResponse,
  ShipmentEventResource
} from './shipments-response';
import {IncidentAssembler} from './incident-assembler';

export class ShipmentAssembler {

  static toEntityFromResource(
    resource: ShipmentResource
  ): Shipment {

    return new Shipment({
      id: resource.id,
      code: resource.code,

      proposalId: resource.proposalId,
      freightRequestId: resource.freightRequestId,
      returnRouteId: resource.returnRouteId,

      carrierId: resource.carrierId,
      carrierName: resource.carrierName,
      carrierPhone: resource.carrierPhone,
      vehicleLabel: resource.vehicleLabel,

      merchantId: resource.merchantId,
      merchantName: resource.merchantName,
      merchantPhone: resource.merchantPhone,

      pickup: SharedAssembler.toAddress(
        resource.pickup
      ),

      delivery: SharedAssembler.toAddress(
        resource.delivery
      ),

      pickupDate: resource.pickupDate,
      pickupWindow: resource.pickupWindow,

      cargoDescription: resource.cargoDescription,
      cargoType: resource.cargoType,
      weightKg: resource.weightKg,

      rate: SharedAssembler.toMoney(
        resource.rate
      ),

      status: new ShipmentStatus(
        resource.status
      ),

      currentLocation:
        resource.currentLocation
          ? SharedAssembler.toGeoLocation(
            resource.currentLocation
          )
          : null,

      events: resource.events.map(
        (event: ShipmentEventResource) => ({
          type: event.type,
          occurredAt: event.occurredAt,
          details: event.details ?? {}
        })
      ),

      incidents: IncidentAssembler.toEntities(
        resource.incidents ?? []
      ),

      createdAt: resource.createdAt,
      pickedUpAt: resource.pickedUpAt,
      deliveredAt: resource.deliveredAt,
      closedAt: resource.closedAt
    });
  }

  static toEntitiesFromResponse(
    response: ShipmentsResponse
  ): Shipment[] {

    return response.shipments.map(
      resource =>
        ShipmentAssembler.toEntityFromResource(
          resource
        )
    );
  }

  static toResourceFromEntity(
    entity: Shipment
  ): ShipmentResource {

    return {
      id: entity.id,
      code: entity.code,

      proposalId: entity.proposalId,
      freightRequestId: entity.freightRequestId,
      returnRouteId: entity.returnRouteId,

      carrierId: entity.carrierId,
      carrierName: entity.carrierName,
      carrierPhone: entity.carrierPhone,
      vehicleLabel: entity.vehicleLabel,

      merchantId: entity.merchantId,
      merchantName: entity.merchantName,
      merchantPhone: entity.merchantPhone,

      pickup: SharedAssembler.toAddressResource(
        entity.pickup
      ),

      delivery: SharedAssembler.toAddressResource(
        entity.delivery
      ),

      pickupDate: entity.pickupDate,
      pickupWindow: entity.pickupWindow,

      cargoDescription: entity.cargoDescription,
      cargoType: entity.cargoType,
      weightKg: entity.weightKg,

      rate: SharedAssembler.toMoneyResource(
        entity.rate
      ),

      status: entity.status.value,

      currentLocation:
        entity.currentLocation
          ? SharedAssembler.toGeoLocationResource(
            entity.currentLocation
          )
          : null,

      events: entity.events.map(
        event => ({
          type: event.type,
          occurredAt: event.occurredAt,
          details: event.details
        })
      ),

      incidents: IncidentAssembler.toResources(
        entity.incidents
      ),

      createdAt: entity.createdAt,
      pickedUpAt: entity.pickedUpAt,
      deliveredAt: entity.deliveredAt,
      closedAt: entity.closedAt
    };
  }

  static clone(
    entity: Shipment
  ): Shipment {

    return ShipmentAssembler.toEntityFromResource(
      ShipmentAssembler.toResourceFromEntity(
        entity
      )
    );
  }
}
