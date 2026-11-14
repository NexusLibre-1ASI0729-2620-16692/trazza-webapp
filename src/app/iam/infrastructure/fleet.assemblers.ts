import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Vehicle} from '../domain/model/vehicle.entity';
import {Driver} from '../domain/model/driver.entity';
import {SavedAddress} from '../domain/model/saved-address.entity';
import {DriverResource, SavedAddressResource, VehicleResource} from './iam-resources';

export class VehicleAssembler implements BaseAssembler<Vehicle, VehicleResource> {
  toEntityFromResource(resource: VehicleResource): Vehicle {
    return new Vehicle({ ...resource });
  }

  toResourceFromEntity(vehicle: Vehicle): Record<string, unknown> {
    return {
      plate: vehicle.plate,
      model: vehicle.model,
      maxLoadKg: vehicle.maxLoadKg,
      cargoLengthM: vehicle.cargoLengthM,
      cargoWidthM: vehicle.cargoWidthM,
      cargoHeightM: vehicle.cargoHeightM,
      cargoVolumeM3: vehicle.cargoVolumeM3 || null,
      photoS3Key: vehicle.photoS3Key || null,
      isActive: vehicle.isActive
    };
  }
}

export class DriverAssembler implements BaseAssembler<Driver, DriverResource> {
  toEntityFromResource(resource: DriverResource): Driver {
    return new Driver({ ...resource });
  }

  toResourceFromEntity(driver: Driver): Record<string, unknown> {
    return { fullName: driver.fullName, sex: driver.sex || null, experienceStars: driver.experienceStars, isActive: driver.isActive };
  }
}

export class SavedAddressAssembler implements BaseAssembler<SavedAddress, SavedAddressResource> {
  toEntityFromResource(resource: SavedAddressResource): SavedAddress {
    return new SavedAddress({ ...resource });
  }

  toResourceFromEntity(address: SavedAddress): Record<string, unknown> {
    return {
      label: address.label,
      address: address.address,
      district: address.district || null,
      latitude: address.latitude,
      longitude: address.longitude
    };
  }
}
