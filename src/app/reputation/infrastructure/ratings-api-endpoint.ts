import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Rating} from '../domain/model/rating.entity';
import {RatingResource, RatingsResponse} from './ratings-response';
import {RatingAssembler} from './rating-assembler';

export class RatingsApiEndpoint extends BaseApiEndpoint<Rating, RatingResource, RatingsResponse, typeof RatingAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderRatingsEndpointPath}`, RatingAssembler);
  }
}
