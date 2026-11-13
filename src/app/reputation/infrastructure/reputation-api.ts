import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Rating} from '../domain/model/rating.entity';
import {RatingsApiEndpoint} from './ratings-api-endpoint';

@Injectable({providedIn: 'root'})
export class ReputationApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly ratingsEndpoint = new RatingsApiEndpoint(this.http);

  getRatings = (): Observable<Rating[]> =>
    this.ratingsEndpoint.getAll();

  createRating = (rating: Rating): Observable<Rating> =>
    this.ratingsEndpoint.create(rating);
}
