import { Vehicle } from '../domain/model/vehicle.entity';
import { LicensePlate } from '../domain/model/license-plate.value-object';
import { LoadCapacity } from '../domain/model/load-capacity.value-object';

export class VehicleAssembler {
  static toEntityFromResource(resource: any): Vehicle {
    return new Vehicle({
      id: resource.id,
      plate: new LicensePlate(resource.plate),
      brandModel: resource.brandModel,
      bodyType: resource.bodyType,
      capacity: new LoadCapacity(resource.capacityKg, resource.volumeM3),
      active: resource.active
    });
  }

  static toEntitiesFromResources(resources: any[]): Vehicle[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }

  static toResourceFromEntity(entity: Vehicle): any {
    return {
      id: entity.id,
      plate: entity.plate.value,
      brandModel: entity.brandModel,
      bodyType: entity.bodyType,
      capacityKg: entity.capacity.weightKg,
      volumeM3: entity.capacity.volumeM3,
      active: entity.active
    };
  }
}