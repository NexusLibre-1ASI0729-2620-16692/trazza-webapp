import {ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatAnchor, MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {MatchmakingStore} from '../../../application/matchmaking.store';
import {ProposalAction} from '../../../infrastructure/matchmaking-api';
import {MatchProposal, Party} from '../../../domain/model/match-proposal.entity';
import {ChatPanel} from '../../components/chat-panel/chat-panel';
import {IamStore} from '../../../../iam/application/iam.store';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {MapStop, RouteMap} from '../../../../shared/presentation/components/route-map/route-map';
import {ConfirmDialog, ConfirmDialogData} from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import {TrazzaMoneyPipe} from '../../../../shared/presentation/pipes/trazza-money.pipe';
import {TrazzaNumberPipe} from '../../../../shared/presentation/pipes/trazza-number.pipe';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';

/** One proposal: details, the route with its stops (A, pick-up 1, delivery 2, B), the chat and the answers. */
@Component({
  selector: 'app-proposal-detail',
  imports: [RouterLink, MatAnchor, MatButton, MatIcon, TranslatePipe, StatusTag, RouteMap, ChatPanel, TrazzaMoneyPipe,
    TrazzaNumberPipe, TrazzaDateTimePipe],
  templateUrl: './proposal-detail.html',
  styles: `.inline-icon { font-size: 1rem; width: 1rem; height: 1rem; vertical-align: middle; }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalDetail implements OnInit {
  /** Route parameter. */
  readonly id = input.required<string>();

  protected readonly iamStore = inject(IamStore);
  protected readonly locale = inject(LocaleService);
  private readonly store = inject(MatchmakingStore);
  private readonly feedback = inject(FeedbackService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly proposal = signal<MatchProposal | null>(null);
  protected readonly busy = signal(false);
  protected readonly counterpart = computed<Party | null>(() => {
    const proposal = this.proposal();
    if (!proposal) return null;
    return this.iamStore.isCarrier() ? proposal.merchant : proposal.carrier;
  });
  protected readonly stops = computed<MapStop[]>(() => {
    const proposal = this.proposal();
    if (!proposal) return [];
    return [
      { label: 'A', ...proposal.route.origin, color: '#64748b' },
      { label: '1', ...proposal.shipment.pickup, color: '#0037b0' },
      { label: '2', ...proposal.shipment.delivery, color: '#16a34a' },
      { label: 'B', ...proposal.route.destination, color: '#64748b' }
    ];
  });

  ngOnInit(): void {
    this.store.getProposal(this.id()).then(proposal => this.proposal.set(proposal)).catch(error => this.feedback.showError(error));
  }

  protected ask(action: ProposalAction): void {
    const data: ConfirmDialogData = {
      titleKey: `proposal.${action}`, messageKey: `proposal.confirm-${action}`, confirmKey: `proposal.${action}`, danger: action !== 'accept'
    };
    this.dialog.open(ConfirmDialog, { data }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.run(action).then();
    });
  }

  private async run(action: ProposalAction): Promise<void> {
    const proposal = this.proposal();
    if (!proposal) return;
    this.busy.set(true);
    const successKeys: Record<ProposalAction, string> = { accept: 'proposal.accepted', reject: 'proposal.rejected', cancel: 'proposal.canceled' };
    await this.feedback.attempt(async () => {
      const updated = await this.store.respondProposal(proposal, action);
      this.proposal.set(updated);
      if (action === 'accept' && updated.tripId) await this.router.navigate(['/execution/trips', updated.tripId]);
    }, successKeys[action]);
    this.busy.set(false);
  }
}
