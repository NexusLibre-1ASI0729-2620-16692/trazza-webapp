import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatAnchor, MatIconAnchor, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {MatchmakingStore} from '../../../application/matchmaking.store';
import {ShipmentRequest} from '../../../domain/model/shipment-request.entity';
import {CompatibleRoutesDialog} from '../../components/compatible-routes-dialog/compatible-routes-dialog';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {PromptDialog, PromptDialogData} from '../../../../shared/presentation/components/prompt-dialog/prompt-dialog';
import {TrazzaNumberPipe} from '../../../../shared/presentation/pipes/trazza-number.pipe';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';

@Component({
  selector: 'app-shipment-request-list',
  imports: [RouterLink, MatTableModule, MatAnchor, MatIconAnchor, MatIconButton, MatIcon, MatTooltip, TranslatePipe, StatusTag,
    EmptyState, TrazzaNumberPipe, TrazzaDateTimePipe],
  templateUrl: './shipment-request-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShipmentRequestList implements OnInit {
  protected readonly store = inject(MatchmakingStore);
  protected readonly locale = inject(LocaleService);
  private readonly feedback = inject(FeedbackService);
  private readonly dialog = inject(MatDialog);

  protected readonly loading = signal(true);
  protected readonly columns = ['shipment', 'cargo', 'window', 'offers', 'status', 'actions'];

  ngOnInit(): void {
    this.store.loadMerchantData()
      .catch(error => this.feedback.showError(error))
      .finally(() => this.loading.set(false));
  }

  protected cancel(shipment: ShipmentRequest): void {
    const data: PromptDialogData = { titleKey: 'shipment.cancel', labelKey: 'fields.reason', confirmKey: 'shipment.cancel', danger: true };
    this.dialog.open(PromptDialog, { data, width: '28rem', maxWidth: '95vw' }).afterClosed().subscribe((reason: string | null) => {
      if (reason) this.feedback.attempt(() => this.store.cancelShipment(shipment, reason), 'shipment.cancelled').then();
    });
  }

  protected async showSuggestions(shipment: ShipmentRequest): Promise<void> {
    try {
      const routes = await this.store.suggestRoutes(shipment.id);
      this.dialog.open(CompatibleRoutesDialog, { data: routes, width: '40rem', maxWidth: '95vw' });
    } catch (error) {
      this.feedback.showError(error);
    }
  }
}
