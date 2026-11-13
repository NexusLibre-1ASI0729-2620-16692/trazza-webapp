import {Routes} from '@angular/router';

export const executionRoutes: Routes = [

  {
    path: 'active-trip',
    loadComponent: () =>
      import('./views/active-trip/active-trip')
        .then(m => m.ActiveTrip),
    title: 'option.active-trip'
  },

  {
    path: 'trip-history',
    loadComponent: () =>
      import('./views/trip-history/trip-history')
        .then(m => m.TripHistory),
    title: 'option.trip-history'
  },

  {
    path: 'shipment-tracking',
    loadComponent: () =>
      import('./views/shipment-tracking/shipment-tracking')
        .then(m => m.ShipmentTracking),
    title: 'option.shipment-tracking'
  },

  {
    path: 'shipment-history',
    loadComponent: () =>
      import('./views/shipment-history/shipment-history')
        .then(m => m.ShipmentHistory),
    title: 'option.shipment-history'
  }

];
