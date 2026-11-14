import {BaseResource} from './base-response';
import {BaseEntity} from '../domain/model/base-entity';

export interface BaseAssembler<TEntity extends BaseEntity, TResource extends BaseResource> {
  toEntityFromResource(resource: TResource): TEntity;

  /** The request body for a create or an update. */
  toResourceFromEntity(entity: TEntity): Partial<TResource> | Record<string, unknown>;
}
