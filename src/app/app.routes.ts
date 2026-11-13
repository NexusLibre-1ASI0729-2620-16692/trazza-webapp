import {Routes} from '@angular/router';
import {iamGuard} from './iam/infrastructure/iam.guard';

const dashboard = () => import('./shared/presentation/views/dashboard/dashboard').then(m => m.Dashboard);
const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);
const iamRoutes = () => import('./iam/presentation/iam.routes').then(m => m.iamRoutes);
const matchmakingRoutes = () => import('./matchmaking/presentation/matchmaking.routes').then(m => m.matchmakingRoutes);
const executionRoutes = () => import('./execution/presentation/execution.routes').then(m => m.executionRoutes);
const billingRoutes = () => import('./billing/presentation/billing.routes').then(m => m.billingRoutes);
const reputationRoutes = () => import('./reputation/presentation/reputation.routes').then(m => m.reputationRoutes);

export const routes: Routes = [
  { path: 'dashboard',   loadComponent: dashboard,         title: 'option.dashboard', canActivate: [iamGuard] },
  { path: 'iam',         loadChildren:  iamRoutes },
  { path: 'matchmaking', loadChildren:  matchmakingRoutes },
  { path: 'execution',   loadChildren:  executionRoutes },
  { path: 'billing',     loadChildren:  billingRoutes, canActivateChild: [iamGuard] },
  { path: 'reputation',  loadChildren:  reputationRoutes },
  { path: '',            redirectTo:    '/dashboard', pathMatch: 'full' },
  { path: '**',          loadComponent: pageNotFound,      title: 'page-not-found.title' }
];
