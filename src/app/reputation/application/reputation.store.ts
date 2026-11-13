import {computed, inject, Injectable, signal} from '@angular/core';
import {defer, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ReputationApi} from '../infrastructure/reputation-api';
import {Rating} from '../domain/model/rating.entity';
import {Score} from '../domain/model/score.value-object';
import {RatingTarget} from '../domain/model/rating-target.value-object';
import {Shipment} from '../../execution/domain/model/shipment.entity';
import {IamStore} from '../../iam/application/iam.store';
import {byNewest} from '../../shared/application/collections';

export interface ReputationSummary {
  average: number;
  count: number;
  distribution: number[];
}

@Injectable({providedIn: 'root'})
export class ReputationStore {
  private readonly reputationApi = inject(ReputationApi);
  private readonly iamStore = inject(IamStore);

  private readonly ratingsSignal = signal<Rating[]>([]);

  private readonly loadingSignal = signal<boolean>(false);

  private readonly errorSignal = signal<string | null>(null);

  readonly ratings = this.ratingsSignal.asReadonly();

  readonly loading = this.loadingSignal.asReadonly();

  readonly error = this.errorSignal.asReadonly();

  readonly myReceivedRatings = computed(() => this.ratingsReceivedBy(this.iamStore.currentUserId()));

  readonly myGivenRatings = computed(() => this.ratings()
    .filter(rating => rating.raterId === this.iamStore.currentUserId())
    .sort(byNewest(rating => rating.createdAt)));

  readonly mySummary = computed(() => this.summaryFor(this.iamStore.currentUserId()));

  loadRatings(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.reputationApi.getRatings().subscribe({
      next: ratings => {
        this.ratingsSignal.set(ratings);
        this.loadingSignal.set(false);
      },
      error: (error: Error) => {
        this.errorSignal.set(error.message);
        this.loadingSignal.set(false);
      }
    });
  }

  ratingsReceivedBy(userId: number | null): Rating[] {
    return this.ratings()
      .filter(rating => rating.target.userId === userId)
      .sort(byNewest(rating => rating.createdAt));
  }

  summaryFor(userId: number | null): ReputationSummary {
    const received = this.ratingsReceivedBy(userId);
    const distribution = [0, 0, 0, 0, 0];
    received.forEach(rating => distribution[rating.score.value - 1]++);
    const total = received.reduce((sum, rating) => sum + rating.score.value, 0);
    return {
      average: received.length ? Math.round(total / received.length * 10) / 10 : 0,
      count: received.length,
      distribution
    };
  }

  ratingForShipmentBy(shipmentId: number, raterId: number | null): Rating | undefined {
    return this.ratings().find(rating => rating.shipmentId === shipmentId && rating.raterId === raterId);
  }

  submitRating(props: { shipment: Shipment; score: number; tags: string[]; comment: string }): Observable<Rating> {
    return defer(() => {
      const raterId = this.iamStore.currentUserId() ?? 0;
      const shipment = props.shipment;
      if (!shipment.status.isDelivered) throw new Error('validation.shipment-not-delivered');
      if (!shipment.involves(raterId)) throw new Error('validation.not-a-party');
      if (this.ratingForShipmentBy(shipment.id, raterId)) throw new Error('validation.already-rated');
      const raterIsCarrier = shipment.carrierId === raterId;
      const rating = new Rating({
        shipmentId: shipment.id,
        raterId,
        raterName: raterIsCarrier ? shipment.carrierName : shipment.merchantName,
        target: raterIsCarrier
          ? new RatingTarget({ userId: shipment.merchantId, role: 'merchant', name: shipment.merchantName })
          : new RatingTarget({ userId: shipment.carrierId, role: 'carrier', name: shipment.carrierName }),
        score: new Score(props.score),
        tags: props.tags,
        comment: props.comment
      });
      return this.reputationApi.createRating(rating).pipe(
        tap(created => this.ratingsSignal.update(ratings => [...ratings, created]))
      );
    });
  }
}
