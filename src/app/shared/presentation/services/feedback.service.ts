import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {LocaleService} from './locale.service';
import {ApiError} from '../../infrastructure/api-error';

@Injectable({providedIn: 'root'})
export class FeedbackService {
  static readonly ERROR_DURATION_MS = 5000;
  static readonly SUCCESS_DURATION_MS = 3000;

  private readonly snackBar = inject(MatSnackBar);
  private readonly locale = inject(LocaleService);

  /**
   * Picks the message to show: the translated problem code from the API, then its detail, then a generic message for
   * field errors, then a translation key carried by the error (domain validations), and finally a generic error.
   */
  describeError(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.code && this.locale.has(`api-errors.${error.code}`)) return this.locale.instant(`api-errors.${error.code}`);
      if (error.detail) return error.detail;
      if (error.hasFieldErrors) return this.locale.instant('errors.invalid-request');
    }
    const key = error instanceof Error ? error.message : '';
    if (this.locale.has(key)) return this.locale.instant(key);
    return this.locale.instant('errors.unexpected');
  }

  showError(error: unknown): void {
    if (error instanceof ApiError && error.isSessionMissing) return;
    console.error(error);
    this.snackBar.open(this.describeError(error), this.locale.instant('actions.close'), {
      duration: FeedbackService.ERROR_DURATION_MS,
      panelClass: 'trazza-snackbar-error',
      politeness: 'assertive'
    });
  }

  showSuccess(key: string, params: Record<string, string | number> = {}): void {
    this.snackBar.open(this.locale.instant(key, params), this.locale.instant('actions.close'), {
      duration: FeedbackService.SUCCESS_DURATION_MS,
      panelClass: 'trazza-snackbar-success',
      politeness: 'polite'
    });
  }

  /** Runs an action and reports its result. Returns true when it worked. */
  async attempt(action: () => Promise<unknown>, successKey?: string, params: Record<string, string | number> = {}): Promise<boolean> {
    try {
      await action();
      if (successKey) this.showSuccess(successKey, params);
      return true;
    } catch (error) {
      this.showError(error);
      return false;
    }
  }
}
