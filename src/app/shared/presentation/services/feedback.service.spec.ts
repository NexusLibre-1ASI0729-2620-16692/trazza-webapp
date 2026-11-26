import {TestBed} from '@angular/core/testing';
import {MatSnackBar} from '@angular/material/snack-bar';
import {provideTranslateService, TranslateService} from '@ngx-translate/core';
import {FeedbackService} from './feedback.service';
import {ApiError} from '../../infrastructure/api-error';

describe('FeedbackService', () => {
  let feedback: FeedbackService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      providers: [provideTranslateService(), { provide: MatSnackBar, useValue: snackBar }]
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      'api-errors.EMAIL_TAKEN': 'This email is already registered',
      'errors.invalid-request': 'Check the highlighted fields',
      'errors.unexpected': 'Something went wrong',
      'validation.reason-required': 'Write a reason',
      'trip.done.cancel': 'Trip cancelled',
      'actions.close': 'Close'
    });
    translate.use('en');
    feedback = TestBed.inject(FeedbackService);
  });

  describe('describeError', () => {
    it('prefers the translated code returned by the API', () => {
      const error = new ApiError('POST /users: 409', 409, 'EMAIL_TAKEN', 'Email taken');
      expect(feedback.describeError(error)).toBe('This email is already registered');
    });

    it('uses the detail of the problem when the code has no translation', () => {
      const error = new ApiError('POST /trips: 422', 422, 'UNKNOWN_CODE', 'The trip has already left');
      expect(feedback.describeError(error)).toBe('The trip has already left');
    });

    it('shows a generic message for field errors without detail', () => {
      const error = new ApiError('POST /trips: 400', 400, null, null, true);
      expect(feedback.describeError(error)).toBe('Check the highlighted fields');
    });

    it('translates the key carried by a domain validation error', () => {
      expect(feedback.describeError(new Error('validation.reason-required'))).toBe('Write a reason');
    });

    it('falls back to the unexpected error message', () => {
      expect(feedback.describeError(new Error('boom'))).toBe('Something went wrong');
      expect(feedback.describeError('boom')).toBe('Something went wrong');
    });
  });

  describe('showError', () => {
    beforeEach(() => spyOn(console, 'error'));

    it('opens an error snackbar', () => {
      feedback.showError(new Error('validation.reason-required'));
      expect(snackBar.open).toHaveBeenCalledWith('Write a reason', 'Close', jasmine.objectContaining({
        duration: FeedbackService.ERROR_DURATION_MS,
        panelClass: 'trazza-snackbar-error'
      }));
    });

    it('stays silent when the request failed only because the session is missing', () => {
      feedback.showError(new ApiError('GET /trips: 401', 401));
      expect(snackBar.open).not.toHaveBeenCalled();
    });
  });

  describe('attempt', () => {
    beforeEach(() => spyOn(console, 'error'));

    it('reports success and shows the success message', async () => {
      const worked = await feedback.attempt(() => Promise.resolve(), 'trip.done.cancel');
      expect(worked).toBeTrue();
      expect(snackBar.open).toHaveBeenCalledWith('Trip cancelled', 'Close', jasmine.objectContaining({
        duration: FeedbackService.SUCCESS_DURATION_MS,
        panelClass: 'trazza-snackbar-success'
      }));
    });

    it('does not show a message when there is no success key', async () => {
      expect(await feedback.attempt(() => Promise.resolve())).toBeTrue();
      expect(snackBar.open).not.toHaveBeenCalled();
    });

    it('returns false and shows the error when the action fails', async () => {
      const worked = await feedback.attempt(() => Promise.reject(new Error('validation.reason-required')));
      expect(worked).toBeFalse();
      expect(snackBar.open).toHaveBeenCalledWith('Write a reason', 'Close', jasmine.objectContaining({ panelClass: 'trazza-snackbar-error' }));
    });
  });
});
