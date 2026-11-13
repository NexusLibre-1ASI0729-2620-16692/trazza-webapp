import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PlatformApi} from '../../shared/infrastructure/platform-api';
import {LoyaltyResource, RatingResource, RatingSummaryResource} from './reputation-resources';
import {Rating} from '../domain/model/rating.entity';
import {LoyaltyAccount} from '../domain/model/loyalty-account.entity';

@Injectable({providedIn: 'root'})
export class ReputationApi extends PlatformApi {
  static readonly RATINGS_PATH = '/ratings';
  static readonly LOYALTY_PATH = '/loyalty';

  rate(tripId: string, score: number, comment: string | null): Observable<Rating> {
    return this.post<RatingResource>(ReputationApi.RATINGS_PATH, { tripId, score, comment }).pipe(map(resource => new Rating(resource)));
  }

  listReceived(): Observable<Rating[]> {
    return this.get<RatingResource[]>(`${ReputationApi.RATINGS_PATH}/received`).pipe(map(items => items.map(item => new Rating(item))));
  }

  listGiven(): Observable<Rating[]> {
    return this.get<RatingResource[]>(`${ReputationApi.RATINGS_PATH}/given`).pipe(map(items => items.map(item => new Rating(item))));
  }

  getSummary(userId: string): Observable<RatingSummaryResource> {
    return this.get(`${ReputationApi.RATINGS_PATH}/summary/${userId}`);
  }

  getPoints(): Observable<LoyaltyAccount> {
    return this.get<LoyaltyResource>(`${ReputationApi.LOYALTY_PATH}/points`).pipe(map(resource => new LoyaltyAccount(resource)));
  }

  redeem(points: number): Observable<LoyaltyAccount> {
    return this.post<LoyaltyResource>(`${ReputationApi.LOYALTY_PATH}/redemptions`, { points }).pipe(map(resource => new LoyaltyAccount(resource)));
  }
}
