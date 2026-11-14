import {Routes} from '@angular/router';

const ratingList = () => import('./views/rating-list/rating-list').then(m => m.RatingList);
const loyaltyPoints = () => import('./views/loyalty-points/loyalty-points').then(m => m.LoyaltyPoints);

export const reputationRoutes: Routes = [
  { path: 'ratings', loadComponent: ratingList, title: 'option.ratings' },
  { path: 'points', loadComponent: loyaltyPoints, title: 'option.points' },
  { path: '', pathMatch: 'full', redirectTo: 'ratings' }
];
