import {inject, Injectable} from '@angular/core';
import {HttpBackend, HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {finalize, map, shareReplay, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {AuthenticatedSessionResource} from './iam-resources';
import {SessionTokenStorage} from './session-token.storage';

/**
 * Exchanges the refresh token for a new session. It uses HttpBackend so the call skips the interceptors, and it
 * shares one request between every call that failed with 401 at the same time.
 */
@Injectable({providedIn: 'root'})
export class SessionRefresher {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly storage = inject(SessionTokenStorage);
  private inFlight: Observable<string> | null = null;

  refresh(): Observable<string> {
    const refreshToken = this.storage.refreshToken;
    if (!refreshToken) return throwError(() => new Error('errors.session-expired'));
    this.inFlight ??= this.http
      .post<AuthenticatedSessionResource>(`${environment.platformApiUrl}${environment.authenticationEndpointPath}/refresh`, { refreshToken })
      .pipe(
        tap(session => this.storage.save(session)),
        map(session => session.accessToken),
        finalize(() => this.inFlight = null),
        shareReplay(1)
      );
    return this.inFlight;
  }
}
