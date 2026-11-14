import {Routes} from '@angular/router';
import {UserRole} from '../../iam/domain/model/user-role.value-object';

const planList = () => import('./views/plan-list/plan-list').then(m => m.PlanList);
const subscriptionList = () => import('./views/subscription-list/subscription-list').then(m => m.SubscriptionList);
const settlementList = () => import('./views/settlement-list/settlement-list').then(m => m.SettlementList);

export const billingRoutes: Routes = [
  { path: 'plans', loadComponent: planList, title: 'option.plans', data: { roles: [UserRole.CARRIER] } },
  { path: 'subscriptions', loadComponent: subscriptionList, title: 'option.subscriptions', data: { roles: [UserRole.CARRIER] } },
  { path: 'settlements', loadComponent: settlementList, title: 'option.settlements' },
  { path: '', pathMatch: 'full', redirectTo: 'settlements' }
];
