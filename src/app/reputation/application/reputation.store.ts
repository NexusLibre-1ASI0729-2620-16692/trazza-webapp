import {computed, inject, Injectable, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {ReputationApi} from '../infrastructure/reputation-api';
import {Rating} from '../domain/model/rating.entity';
import {LoyaltyAccount} from '../domain/model/loyalty-account.entity';

/** Ratings received and given, and the loyalty points account. */
@Injectable({providedIn: 'root'})
export class ReputationStore {
  private readonly api = inject(ReputationApi);

  private readonly receivedSignal = signal<Rating[]>([]);
  private readonly givenSignal = signal<Rating[]>([]);
  private readonly loyaltySignal = signal<LoyaltyAccount>(new LoyaltyAccount());
  private readonly loadedSignal = signal(false);

  readonly received = this.receivedSignal.asReadonly();
  readonly given = this.givenSignal.asReadonly();
  readonly loyalty = this.loyaltySignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();
  readonly averageScore = computed<number | null>(() => {
    const received = this.received();
    return received.length ? received.reduce((total, rating) => total + rating.score, 0) / received.length : null;
  });

  async loadRatings(): Promise<void> {
    const [received, given] = await Promise.all([firstValueFrom(this.api.listReceived()), firstValueFrom(this.api.listGiven())]);
    this.receivedSignal.set(received);
    this.givenSignal.set(given);
    this.loadedSignal.set(true);
  }

  async loadLoyalty(): Promise<void> {
    this.loyaltySignal.set(await firstValueFrom(this.api.getPoints()));
  }

  hasRated(tripId: string): boolean {
    return this.given().some(rating => rating.tripId === tripId);
  }

  async rateTrip(tripId: string, score: number, comment: string): Promise<Rating> {
    Rating.assertScore(score);
    const rating = await firstValueFrom(this.api.rate(tripId, score, (comment ?? '').trim() || null));
    this.givenSignal.update(given => [rating, ...given]);
    await this.loadLoyalty();
    return rating;
  }

  async redeemPoints(points: number | null): Promise<void> {
    this.loyalty().assertCanRedeem(points);
    this.loyaltySignal.set(await firstValueFrom(this.api.redeem(points!)));
  }
}
