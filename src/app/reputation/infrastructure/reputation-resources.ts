import {LoyaltyEntry} from '../domain/model/loyalty-account.entity';

export interface RatingResource {
  id: number;
  tripId: string;
  counterpartId: string;
  counterpartName: string;
  score: number;
  comment: string | null;
  createdAt: string;
}

export interface RatingSummaryResource {
  userId: string;
  name: string;
  averageScore: number | null;
  ratingsCount: number;
}

export interface LoyaltyResource {
  balance: number;
  entries: LoyaltyEntry[];
}
