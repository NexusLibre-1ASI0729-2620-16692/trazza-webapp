import {HttpErrorResponse} from '@angular/common/http';

/** A failed call to the platform. It keeps the RFC 7807 problem details that the API returns. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | null = null,
    readonly detail: string | null = null,
    readonly hasFieldErrors = false
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * True when a call outside authentication was rejected for lack of a valid session, for example a page that was
   * still loading when the user signed out. The interceptor already refreshed or closed the session, so there is
   * nothing to tell the user.
   */
  get isSessionMissing(): boolean {
    return this.status === 401 && !this.message.includes('/authentication');
  }

  static fromHttpError(error: HttpErrorResponse, operation: string): ApiError {
    if (error.status === 0) return new ApiError('errors.network', 0);
    const problem = (error.error && typeof error.error === 'object') ? error.error as Record<string, unknown> : {};
    const code = typeof problem['code'] === 'string' ? problem['code'] : null;
    const detail = typeof problem['detail'] === 'string' ? problem['detail'] : null;
    const hasFieldErrors = !!problem['errors'];
    return new ApiError(`${operation}: ${error.status}`, error.status, code, detail, hasFieldErrors);
  }
}
