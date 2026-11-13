import {inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {ErrorHandlingEnabledBaseType} from './error-handling-enabled-base-type';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

/** Base of every bounded context API. It talks to the Trazza Platform and turns HTTP errors into ApiError. */
export abstract class PlatformApi extends ErrorHandlingEnabledBaseType {
  protected readonly http = inject(HttpClient);
  protected readonly platformApiUrl = environment.platformProviderApiBaseUrl;

  protected url(path: string): string {
    return `${this.platformApiUrl}${path}`;
  }

  protected toParams(query: QueryParams = {}): HttpParams {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') params = params.set(key, String(value));
    });
    return params;
  }

  protected get<T>(path: string, query: QueryParams = {}): Observable<T> {
    return this.http.get<T>(this.url(path), { params: this.toParams(query) }).pipe(catchError(this.handleError(`GET ${path}`)));
  }

  protected post<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.post<T>(this.url(path), body).pipe(catchError(this.handleError(`POST ${path}`)));
  }

  protected put<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.put<T>(this.url(path), body).pipe(catchError(this.handleError(`PUT ${path}`)));
  }

  protected delete<T = void>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path)).pipe(catchError(this.handleError(`DELETE ${path}`)));
  }
}
