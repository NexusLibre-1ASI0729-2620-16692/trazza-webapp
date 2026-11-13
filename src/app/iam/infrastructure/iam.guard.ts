import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SESSION_TOKEN_KEY } from './iam.interceptor';

export const iamGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem(SESSION_TOKEN_KEY);

  if (token) {
    return true;
  }

  return router.createUrlTree(['/iam/sign-in']);
};
