import {Routes} from '@angular/router';
import {UserRole} from '../../iam/domain/model/user-role.value-object';

const tripList = () => import('./views/trip-list/trip-list').then(m => m.TripList);
const tripDetail = () => import('./views/trip-detail/trip-detail').then(m => m.TripDetail);
const iotDeviceList = () => import('./views/iot-device-list/iot-device-list').then(m => m.IotDeviceList);

export const executionRoutes: Routes = [
  { path: 'trips', loadComponent: tripList, title: 'option.trips' },
  { path: 'trips/:id', loadComponent: tripDetail, title: 'trip.detail-title' },
  { path: 'iot-devices', loadComponent: iotDeviceList, title: 'option.iot-devices', data: { roles: [UserRole.CARRIER] } },
  { path: '', pathMatch: 'full', redirectTo: 'trips' }
];
