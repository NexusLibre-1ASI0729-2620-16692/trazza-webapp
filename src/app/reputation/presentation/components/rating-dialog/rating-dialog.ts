import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {TranslatePipe} from '@ngx-translate/core';
import {ReputationStore} from '../../../application/reputation.store';
import {Rating} from '../../../domain/model/rating.entity';
import {RatingTarget} from '../../../domain/model/rating-target.value-object';
import {StarRating} from '../star-rating/star-rating';
import {Shipment} from '../../../../execution/domain/model/shipment.entity';
import {IamStore} from '../../../../iam/application/iam.store';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';

export interface RatingDialogData {
  shipment: Shipment;
}

@Component({
  selector: 'app-rating-dialog',
  imports: [MatDialogModule, MatFormFieldModule, MatInput, MatButton, MatIcon, MatChipsModule, TranslatePipe, StarRating],
  templateUrl: './rating-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingDialog {
  static readonly DEFAULT_SCORE = 5;

  protected readonly data = inject<RatingDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<RatingDialog, boolean>>(MatDialogRef);
  private readonly store = inject(ReputationStore);
  private readonly iamStore = inject(IamStore);
  private readonly feedback = inject(FeedbackService);

  protected readonly maxCommentLength = Rating.MAX_COMMENT_LENGTH;

  protected readonly targetRole = computed(() => this.iamStore.isCarrier() ? 'merchant' : 'carrier');

  protected readonly targetName = computed(() => this.targetRole() === 'merchant' ? this.data.shipment.merchantName : this.data.shipment.carrierName);

  protected readonly tagOptions = computed(() => RatingTarget.TAGS[this.targetRole()]);

  protected readonly score = signal(RatingDialog.DEFAULT_SCORE);

  protected readonly tags = signal<string[]>([]);

  protected readonly comment = signal('');

  protected readonly sending = signal(false);

  protected readonly errorMessage = signal('');

  protected updateComment(event: Event): void {
    this.comment.set((event.target as HTMLTextAreaElement).value);
  }

  protected submit(): void {
    this.errorMessage.set('');
    this.sending.set(true);
    this.store.submitRating({ shipment: this.data.shipment, score: this.score(), tags: this.tags(), comment: this.comment() }).subscribe({
      next: () => {
        this.sending.set(false);
        this.feedback.showSuccess('rating.sent');
        this.dialogRef.close(true);
      },
      error: error => {
        this.sending.set(false);
        this.errorMessage.set(this.feedback.describeError(error));
      }
    });
  }
}
