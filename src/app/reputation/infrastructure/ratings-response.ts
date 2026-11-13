import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface RatingResource extends BaseResource {
  id: number;
  shipmentId: number;
  raterId: number;
  raterName: string;
  targetId: number;
  targetRole: string;
  targetName: string;
  score: number;
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface RatingsResponse extends BaseResponse {
  ratings: RatingResource[];
}
