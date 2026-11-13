import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatAnchor, MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {BillingStore} from '../../../application/billing.store';
import {Subscription} from '../../../domain/model/subscription.entity';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {ConfirmDialog, ConfirmDialogData} from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import {TrazzaDatePipe} from '../../../../shared/presentation/pipes/trazza-date.pipe';
import {TrazzaMoneyPipe} from '../../../../shared/presentation/pipes/trazza-money.pipe';

@Component({
  selector: 'app-subscription-list',
  imports: [RouterLink, MatTableModule, MatAnchor, MatButton, MatIcon, TranslatePipe, StatusTag, EmptyState, TrazzaDatePipe, TrazzaMoneyPipe],
  templateUrl: './subscription-list.html',
  styles: `.danger-text { color: #b91c1c; }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionList implements OnInit {
  protected readonly store = inject(BillingStore);
  protected readonly locale = inject(LocaleService);
  private readonly feedback = inject(FeedbackService);
  private readonly dialog = inject(MatDialog);

  protected readonly paymentColumns = ['date', 'amount', 'operation', 'status'];

  ngOnInit(): void {
    this.store.loadSubscriptions().catch(error => this.feedback.showError(error));
  }

  protected renew(subscription: Subscription): void {
    this.feedback.attempt(() => this.store.renew(subscription), 'subscription.renewed').then();
  }

  protected cancel(subscription: Subscription): void {
    const data: ConfirmDialogData = {
      titleKey: 'subscription.cancel', messageKey: 'subscription.confirm-cancel', confirmKey: 'subscription.cancel', danger: true
    };
    this.dialog.open(ConfirmDialog, { data }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.feedback.attempt(() => this.store.cancelSubscription(subscription), 'subscription.cancelled').then();
    });
  }
}
