import {Routes} from '@angular/router';
import {UserRole} from '../../iam/domain/model/user-role.value-object';

const returnRouteList = () => import('./views/return-route-list/return-route-list').then(m => m.ReturnRouteList);
const returnRouteForm = () => import('./views/return-route-form/return-route-form').then(m => m.ReturnRouteForm);
const routeSuggestions = () => import('./views/route-suggestions/route-suggestions').then(m => m.RouteSuggestions);
const openShipments = () => import('./views/open-shipments/open-shipments').then(m => m.OpenShipments);
const shipmentRequestList = () => import('./views/shipment-request-list/shipment-request-list').then(m => m.ShipmentRequestList);
const shipmentRequestForm = () => import('./views/shipment-request-form/shipment-request-form').then(m => m.ShipmentRequestForm);
const proposalList = () => import('./views/proposal-list/proposal-list').then(m => m.ProposalList);
const proposalDetail = () => import('./views/proposal-detail/proposal-detail').then(m => m.ProposalDetail);

const carrier = { roles: [UserRole.CARRIER] };
const merchant = { roles: [UserRole.MERCHANT] };

export const matchmakingRoutes: Routes = [
  { path: 'return-routes', loadComponent: returnRouteList, title: 'option.return-routes', data: carrier },
  { path: 'return-routes/new', loadComponent: returnRouteForm, title: 'return-route.new-title', data: carrier },
  { path: 'return-routes/:id', loadComponent: routeSuggestions, title: 'route-suggestions.title', data: carrier },
  { path: 'open-shipments', loadComponent: openShipments, title: 'option.open-shipments', data: carrier },
  { path: 'shipment-requests', loadComponent: shipmentRequestList, title: 'option.shipment-requests', data: merchant },
  { path: 'shipment-requests/new', loadComponent: shipmentRequestForm, title: 'shipment.new-title', data: merchant },
  { path: 'proposals', loadComponent: proposalList, title: 'option.proposals' },
  { path: 'proposals/:id', loadComponent: proposalDetail, title: 'proposal.detail-title' },
  { path: '', pathMatch: 'full', redirectTo: 'proposals' }
];
