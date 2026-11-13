import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {MatchmakingStore} from '../../../application/matchmaking.store';
import {ShipmentRequest} from '../../../domain/model/shipment-request.entity';
import {ReturnRoute} from '../../../domain/model/return-route.entity';
import {MatchProposal} from '../../../domain/model/match-proposal.entity';
import {CreateMatchProposalCommand} from '../../../domain/commands/create-match-proposal.command';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {TrazzaNumberPipe} from '../../../../shared/presentation/pipes/trazza-number.pipe';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';

export interface OfferDialogData {
  shipment: ShipmentRequest;
  routes: ReturnRoute[];
  routeId?: string | null;
}

/** The carrier offers a price to carry a shipment on one of its open return routes. Closes with the proposal. */
@Component({
  selector: 'app-offer-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInput, MatSelectModule, MatButton, MatIcon,
    TranslatePipe, TrazzaNumberPipe, TrazzaDateTimePipe],
  templateUrl: './offer-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferDialog {
  protected readonly data = inject<OfferDialogData>(MAT_DIALOG_DATA);
  protected readonly locale = inject(LocaleService);
  private readonly dialogRef = inject(MatDialogRef<OfferDialog, MatchProposal | null>);
  private readonly store = inject(MatchmakingStore);
  private readonly feedback = inject(FeedbackService);

  protected readonly sending = signal(false);
  protected readonly form = inject(FormBuilder).group({
    routeId: [{ value: this.data.routeId ?? this.data.routes[0]?.id ?? null, disabled: !!this.data.routeId }],
    rate: [null as number | null]
  });

  protected async submit(): Promise<void> {
    const value = this.form.getRawValue();
    this.sending.set(true);
    let proposal: MatchProposal | null = null;
    await this.feedback.attempt(async () => {
      proposal = await this.store.createProposal(new CreateMatchProposalCommand({
        shipmentRequestId: this.data.shipment.id, returnRouteId: value.routeId, offeredRate: value.rate
      }));
    }, 'offer.sent');
    this.sending.set(false);
    if (proposal) this.dialogRef.close(proposal);
  }
}
