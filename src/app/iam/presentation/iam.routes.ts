import {Routes} from '@angular/router';
import {authenticationGuard} from '../infrastructure/iam.guard';
import {UserRole} from '../domain/model/user-role.value-object';

const signIn = () => import('./views/sign-in/sign-in').then(m => m.SignIn);
const signUp = () => import('./views/sign-up/sign-up').then(m => m.SignUp);
const profile = () => import('./views/profile/profile').then(m => m.Profile);
const vehicleList = () => import('./views/vehicle-list/vehicle-list').then(m => m.VehicleList);
const driverList = () => import('./views/driver-list/driver-list').then(m => m.DriverList);
const savedAddressList = () => import('./views/saved-address-list/saved-address-list').then(m => m.SavedAddressList);

export const iamRoutes: Routes = [
  { path: 'sign-in', loadComponent: signIn, canActivate: [authenticationGuard], title: 'sign-in.title', data: { public: true } },
  { path: 'sign-up', loadComponent: signUp, canActivate: [authenticationGuard], title: 'sign-up.title', data: { public: true } },
  { path: 'profile', loadComponent: profile, canActivate: [authenticationGuard], title: 'option.profile' },
  { path: 'vehicles', loadComponent: vehicleList, canActivate: [authenticationGuard], title: 'option.vehicles', data: { roles: [UserRole.CARRIER] } },
  { path: 'drivers', loadComponent: driverList, canActivate: [authenticationGuard], title: 'option.drivers', data: { roles: [UserRole.CARRIER] } },
  { path: 'saved-addresses', loadComponent: savedAddressList, canActivate: [authenticationGuard], title: 'option.saved-addresses' },
  { path: '', pathMatch: 'full', redirectTo: 'profile' }
];
