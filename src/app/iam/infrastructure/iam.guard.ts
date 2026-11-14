import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {IamStore} from '../application/iam.store';
import {UserRole} from '../domain/model/user-role.value-object';

/**
 * Protects private routes and checks the roles in the route data (data.roles). When the user holds the required
 * role but is working with the other one, the active role is switched. Public routes (data.public) are only for
 * signed out users.
 */
export const authenticationGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const store = inject(IamStore);
  const router = inject(Router);
  const isPublic = route.data['public'] === true;
  if (!store.isSignedIn()) return isPublic ? true : router.createUrlTree(['/iam/sign-in'], { queryParams: { redirect: state.url } });
  if (isPublic) return router.createUrlTree(['/dashboard']);
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;
  if (!allowedRoles?.length || allowedRoles.includes(store.activeRole() as UserRole)) return true;
  const role = allowedRoles.find(item => store.roles().includes(item));
  if (!role) return router.createUrlTree(['/dashboard']);
  store.switchRole(role);
  return true;
};
