import {Incident} from '../domain/model/incident.entity';
import {IncidentType} from '../domain/model/incident-type.value-object';
import {IncidentResource} from './shipments-response';

export class IncidentAssembler {

  static toEntityFromResource(
    resource: IncidentResource
  ): Incident {
    return new Incident({
      id: resource.id,
      type: new IncidentType(resource.type),
      description: resource.description,
      reporterId: resource.reporterId,
      reporterRole: resource.reporterRole,
      reportedAt: resource.reportedAt,
      status: resource.status
    });
  }

  static toEntities(
    resources: IncidentResource[]
  ): Incident[] {
    return resources.map(
      resource =>
        IncidentAssembler.toEntityFromResource(resource)
    );
  }

  static toResourceFromEntity(
    entity: Incident
  ): IncidentResource {
    return {
      id: entity.id ?? 0,
      type: entity.type.value,
      description: entity.description,
      reporterId: entity.reporterId,
      reporterRole: entity.reporterRole,
      reportedAt: entity.reportedAt,
      status: entity.status
    };
  }

  static toResources(
    entities: Incident[]
  ): IncidentResource[] {
    return entities.map(
      entity =>
        IncidentAssembler.toResourceFromEntity(entity)
    );
  }
}
