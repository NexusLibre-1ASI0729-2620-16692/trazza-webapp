import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {ReputationStore} from '../../../application/reputation.store';
import {Rating} from '../../../domain/model/rating.entity';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {StarRating} from '../../../../shared/presentation/components/star-rating/star-rating';

export interface RatingDialogData {
  tripId: string;
  counterpartName: string;
}

/** Rate the other side of a confirmed trip. Closes with the rating. */
@Component({
  selector: 'app-rating-dialog',
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInput, MatButton, MatIcon, TranslatePipe, StarRating],
  template: `
    <h2 mat-dialog-title>{{ 'rating.title' | translate: { name: data.counterpartName } }}</h2>
    <mat-dialog-content>
      <div class="stack">
        <app-star-rating [readonly]="false" [(value)]="score" [label]="'rating.title' | translate: { name: data.counterpartName }"/>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'fields.comment' | translate }}</mat-label>
          <textarea matInput rows="3" maxlength="500" [(ngModel)]="comment"></textarea>
        </mat-form-field>
        <small class="trazza-muted text-sm">{{ 'rating.points-hint' | translate }}</small>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>{{ 'actions.cancel' | translate }}</button>
      <button mat-flat-button type="button" [disabled]="sending()" (click)="submit()"><mat-icon>star</mat-icon>{{ 'rating.send' | translate }}</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingDialog {
  protected readonly data = inject<RatingDialogData>(MAT_DIALOG_DATA);
  private readonly store = inject(ReputationStore);
  private readonly feedback = inject(FeedbackService);
  private readonly dialogRef = inject(MatDialogRef<RatingDialog, Rating | null>);

  protected readonly score = signal(5);
  protected readonly sending = signal(false);
  protected comment = '';

  protected async submit(): Promise<void> {
    this.sending.set(true);
    let rating: Rating | null = null;
    await this.feedback.attempt(async () => {
      rating = await this.store.rateTrip(this.data.tripId, this.score(), this.comment);
    }, 'rating.sent');
    this.sending.set(false);
    if (rating) this.dialogRef.close(rating);
  }
}
