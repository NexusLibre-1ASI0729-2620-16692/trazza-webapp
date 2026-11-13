import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {ReputationStore} from '../../../application/reputation.store';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';
import {statusKey} from '../../../../shared/presentation/formatters';

@Component({
  selector: 'app-loyalty-points',
  imports: [FormsModule, MatTableModule, MatFormFieldModule, MatInput, MatButton, MatIcon, TranslatePipe, EmptyState, TrazzaDateTimePipe],
  templateUrl: './loyalty-points.html',
  styles: `.balance { font-size: 3rem; } .positive { color: #15803d; } .negative { color: #b91c1c; }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoyaltyPoints implements OnInit {
  protected readonly store = inject(ReputationStore);
  protected readonly locale = inject(LocaleService);
  private readonly feedback = inject(FeedbackService);

  protected readonly columns = ['date', 'reason', 'points'];
  protected readonly key = statusKey;
  protected points: number | null = null;

  ngOnInit(): void {
    this.store.loadLoyalty().catch(error => this.feedback.showError(error));
  }

  protected async redeem(): Promise<void> {
    const points = this.points === null ? null : Number(this.points);
    const redeemed = await this.feedback.attempt(() => this.store.redeemPoints(points), 'points.redeemed');
    if (redeemed) this.points = null;
  }
}
