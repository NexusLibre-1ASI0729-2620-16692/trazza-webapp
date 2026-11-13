import { User } from '../domain/model/user.entity';
import { Email } from '../domain/model/email.value-object';
import { Phone } from '../domain/model/phone.value-object';
import { UserRole } from '../domain/model/user-role.value-object';

export class UserAssembler {
  static toEntityFromResource(resource: any): User {
    return new User({
      id: resource.id,
      fullName: resource.fullName,
      email: new Email(resource.email),
      phone: new Phone(resource.phone),
      role: new UserRole(resource.role),
      createdAt: resource.createdAt ?? null
    });
  }

  static toEntitiesFromResources(resources: any[]): User[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }

  static toResourceFromEntity(entity: User): any {
    return {
      id: entity.id,
      fullName: entity.fullName,
      email: entity.email.value,
      phone: entity.phone.value,
      role: entity.role.value,
      createdAt: entity.createdAt
    };
  }
}