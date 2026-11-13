import {Routes} from '@angular/router';

export const billingRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./views/plan-billing/plan-billing').then(m => m.PlanBilling)
  }
];
