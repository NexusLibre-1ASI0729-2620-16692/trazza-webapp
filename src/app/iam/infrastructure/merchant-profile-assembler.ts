import { MerchantProfile } from '../domain/model/merchant-profile.entity';
import { Ruc } from '../domain/model/ruc.value-object';
import { Phone } from '../domain/model/phone.value-object';

export class MerchantProfileAssembler {
  static toEntityFromResource(resource: any): MerchantProfile {
    return new MerchantProfile({
      id: resource.id,
      userId: resource.userId,
      businessName: resource.businessName,
      contactName: resource.contactName,
      ruc: new Ruc(resource.ruc),
      phone: new Phone(resource.phone),
      verified: resource.verified
    });
  }

  static toEntitiesFromResources(resources: any[]): MerchantProfile[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }

  static toResourceFromEntity(entity: MerchantProfile): any {
    return {
      id: entity.id,
      userId: entity.userId,
      businessName: entity.businessName,
      contactName: entity.contactName,
      ruc: entity.ruc.value,
      phone: entity.phone.value,
      verified: entity.verified
    };
  }
}