import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatIconAnchor} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {MatchmakingStore} from '../../../application/matchmaking.store';
import {MatchProposal} from '../../../domain/model/match-proposal.entity';
import {IamStore} from '../../../../iam/application/iam.store';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {TrazzaMoneyPipe} from '../../../../shared/presentation/pipes/trazza-money.pipe';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';

@Component({
  selector: 'app-proposal-list',
  imports: [RouterLink, MatTableModule, MatIconAnchor, MatIcon, TranslatePipe, StatusTag, EmptyState, TrazzaMoneyPipe, TrazzaDateTimePipe],
  templateUrl: './proposal-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalList implements OnInit {
  protected readonly store = inject(MatchmakingStore);
  protected readonly iamStore = inject(IamStore);
  protected readonly locale = inject(LocaleService);
  private readonly feedback = inject(FeedbackService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly columns = ['shipment', 'counterpart', 'rate', 'date', 'status', 'actions'];

  ngOnInit(): void {
    this.store.loadProposals()
      .catch(error => this.feedback.showError(error))
      .finally(() => this.loading.set(false));
  }

  protected open(proposal: MatchProposal): void {
    this.router.navigate(['/matchmaking/proposals', proposal.id]).then();
  }
}
