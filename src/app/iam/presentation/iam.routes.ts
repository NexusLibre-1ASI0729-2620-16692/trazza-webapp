import { Routes } from '@angular/router';
import { SignInComponent } from './views/sign-in/sign-in.component';
import { SignUpComponent } from './views/sign-up/sign-up.component';
import { ProfileComponent } from './views/profile/profile.component';
import { VehicleListComponent } from './views/vehicle-list/vehicle-list.component';
import { VehicleFormComponent } from './views/vehicle-form/vehicle-form.component';

export const iamRoutes: Routes = [
  { path: 'sign-in', component: SignInComponent, title: 'Sign In - Trazza' },
  { path: 'sign-up', component: SignUpComponent, title: 'Sign Up - Trazza' },
  { path: 'profile', component: ProfileComponent, title: 'Profile' },
  { path: 'vehicles', component: VehicleListComponent, title: 'Vehicles' },
  { path: 'vehicles/new', component: VehicleFormComponent, title: 'New Vehicle' },
  { path: 'vehicles/:id/edit', component: VehicleFormComponent, title: 'Edit Vehicle' }
];
