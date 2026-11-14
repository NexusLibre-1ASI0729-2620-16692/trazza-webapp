import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {MatchmakingStore} from '../../../application/matchmaking.store';
import {ShipmentRequest} from '../../../domain/model/shipment-request.entity';
import {OfferDialog, OfferDialogData} from '../../components/offer-dialog/offer-dialog';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {TrazzaNumberPipe} from '../../../../shared/presentation/pipes/trazza-number.pipe';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';

@Component({
  selector: 'app-open-shipments',
  imports: [RouterLink, MatTableModule, MatButton, TranslatePipe, EmptyState, TrazzaNumberPipe, TrazzaDateTimePipe],
  templateUrl: './open-shipments.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpenShipments implements OnInit {
  protected readonly store = inject(MatchmakingStore);
  protected readonly locale = inject(LocaleService);
  private readonly feedback = inject(FeedbackService);
  private readonly dialog = inject(MatDialog);

  protected readonly loading = signal(true);
  protected readonly columns = ['shipment', 'cargo', 'window', 'actions'];

  ngOnInit(): void {
    this.store.loadCarrierData()
      .catch(error => this.feedback.showError(error))
      .finally(() => this.loading.set(false));
  }

  protected offer(shipment: ShipmentRequest): void {
    const data: OfferDialogData = { shipment, routes: this.store.openRoutes() };
    this.dialog.open(OfferDialog, { data, width: '34rem', maxWidth: '95vw' });
  }
}
