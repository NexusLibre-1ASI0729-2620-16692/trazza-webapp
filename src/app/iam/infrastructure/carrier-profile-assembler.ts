import { CarrierProfile } from '../domain/model/carrier-profile.entity';
import { Dni } from '../domain/model/dni.value-object';
import { Phone } from '../domain/model/phone.value-object';
import { VehicleAssembler } from './vehicle-assembler';

export class CarrierProfileAssembler {
  static toEntityFromResource(resource: any): CarrierProfile {
    return new CarrierProfile({
      id: resource.id,
      userId: resource.userId,
      fullName: resource.fullName,
      dni: new Dni(resource.dni),
      phone: new Phone(resource.phone),
      verified: resource.verified,
      vehicles: (resource.vehicles ?? []).map((v: any) => VehicleAssembler.toEntityFromResource(v))
    });
  }

  static toEntitiesFromResources(resources: any[]): CarrierProfile[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }

  static toResourceFromEntity(entity: CarrierProfile): any {
    return {
      id: entity.id,
      userId: entity.userId,
      fullName: entity.fullName,
      dni: entity.dni.value,
      phone: entity.phone.value,
      verified: entity.verified,
      vehicles: entity.vehicles.map(v => VehicleAssembler.toResourceFromEntity(v))
    };
  }
}