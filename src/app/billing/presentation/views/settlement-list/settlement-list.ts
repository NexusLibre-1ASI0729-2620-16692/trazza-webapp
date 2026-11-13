import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {BillingStore} from '../../../application/billing.store';
import {FreightSettlement} from '../../../domain/model/freight-settlement.entity';
import {CancellationCompensation, CompensationAction} from '../../../domain/model/cancellation-compensation.entity';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {PromptDialog, PromptDialogData} from '../../../../shared/presentation/components/prompt-dialog/prompt-dialog';
import {TrazzaMoneyPipe} from '../../../../shared/presentation/pipes/trazza-money.pipe';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';

@Component({
  selector: 'app-settlement-list',
  imports: [RouterLink, MatTableModule, MatButton, TranslatePipe, StatusTag, EmptyState, TrazzaMoneyPipe, TrazzaDateTimePipe],
  templateUrl: './settlement-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettlementList implements OnInit {
  protected readonly store = inject(BillingStore);
  protected readonly locale = inject(LocaleService);
  private readonly feedback = inject(FeedbackService);
  private readonly dialog = inject(MatDialog);

  protected readonly settlementColumns = ['trip', 'amount', 'reference', 'status', 'actions'];
  protected readonly compensationColumns = ['trip', 'amount', 'status', 'actions'];

  ngOnInit(): void {
    this.store.loadSettlements().catch(error => this.feedback.showError(error));
  }

  /** The freight is paid outside the platform; the merchant can leave the transfer reference. */
  protected markPaid(settlement: FreightSettlement): void {
    const data: PromptDialogData = {
      titleKey: 'settlement.mark-paid', labelKey: 'settlement.reference', messageKey: 'settlement.external-note',
      confirmKey: 'settlement.mark-paid', required: false, maxLength: 100
    };
    this.dialog.open(PromptDialog, { data, width: '28rem', maxWidth: '95vw' }).afterClosed().subscribe((reference: string | null) => {
      if (reference === null || reference === undefined) return;
      this.feedback.attempt(() => this.store.markPaid(settlement, reference), 'settlement.marked-paid').then();
    });
  }

  protected confirm(settlement: FreightSettlement): void {
    this.feedback.attempt(() => this.store.confirmSettlement(settlement), 'settlement.confirmed').then();
  }

  protected compensate(compensation: CancellationCompensation, action: CompensationAction): void {
    this.feedback.attempt(() => this.store.updateCompensation(compensation, action), `compensation.done.${action}`).then();
  }
}
