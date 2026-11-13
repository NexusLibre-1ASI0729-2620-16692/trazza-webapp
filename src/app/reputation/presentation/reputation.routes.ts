import {Routes} from '@angular/router';
import {iamGuard} from '../../iam/infrastructure/iam.guard';

const ratingList = () => import('./views/rating-list/rating-list').then(m => m.RatingList);

export const reputationRoutes: Routes = [
  { path: 'ratings', loadComponent: ratingList, title: 'option.ratings', canActivate: [iamGuard] }
];
