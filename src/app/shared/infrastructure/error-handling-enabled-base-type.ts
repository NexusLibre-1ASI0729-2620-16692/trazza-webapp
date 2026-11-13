import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {ApiError} from './api-error';

export abstract class ErrorHandlingEnabledBaseType {
  protected handleError = (operation: string) =>
    (error: unknown): Observable<never> => {
      if (error instanceof HttpErrorResponse) return throwError(() => ApiError.fromHttpError(error, operation));
      return throwError(() => error instanceof Error ? error : new Error('errors.unexpected'));
    };
}
