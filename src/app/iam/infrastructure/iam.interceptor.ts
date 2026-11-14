import {HttpErrorResponse, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {SessionTokenStorage} from './session-token.storage';
import {SessionRefresher} from './session-refresher';

const withSession = (request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> => request.clone({
  setHeaders: {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Accept-Language': document.documentElement.lang || 'en'
  }
});

/**
 * Adds the JWT and the user's language to every call to the platform. When a call fails with 401 it refreshes the
 * session once and repeats the call; if the refresh fails too, the local session is cleared.
 */
export const iamInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.platformApiUrl)) return next(request);
  const storage = inject(SessionTokenStorage);
  const refresher = inject(SessionRefresher);
  const isAuthenticationCall = request.url.startsWith(`${environment.platformApiUrl}${environment.authenticationEndpointPath}/`);

  return next(withSession(request, storage.accessToken)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthenticationCall || !storage.refreshToken)
        return throwError(() => error);
      return refresher.refresh().pipe(
        catchError(() => {
          storage.clear();
          return throwError(() => error);
        }),
        switchMap(token => next(withSession(request, token)))
      );
    })
  );
};
