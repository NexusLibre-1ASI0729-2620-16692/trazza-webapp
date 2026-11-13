import {Rating} from '../domain/model/rating.entity';
import {Score} from '../domain/model/score.value-object';
import {RatingTarget} from '../domain/model/rating-target.value-object';
import {RatingResource, RatingsResponse} from './ratings-response';

export class RatingAssembler {
  static toEntityFromResource(resource: RatingResource): Rating {
    return new Rating({
      id: resource.id,
      shipmentId: resource.shipmentId,
      raterId: resource.raterId,
      raterName: resource.raterName,
      target: new RatingTarget({ userId: resource.targetId, role: resource.targetRole, name: resource.targetName }),
      score: new Score(resource.score),
      tags: resource.tags,
      comment: resource.comment,
      createdAt: resource.createdAt
    });
  }

  static toEntitiesFromResponse(response: RatingsResponse): Rating[] {
    return response.ratings.map(resource => RatingAssembler.toEntityFromResource(resource));
  }

  static toResourceFromEntity(entity: Rating): RatingResource {
    return {
      id: entity.id,
      shipmentId: entity.shipmentId,
      raterId: entity.raterId,
      raterName: entity.raterName,
      targetId: entity.target.userId,
      targetRole: entity.target.role,
      targetName: entity.target.name,
      score: entity.score.value,
      tags: [...entity.tags],
      comment: entity.comment,
      createdAt: entity.createdAt
    };
  }
}
