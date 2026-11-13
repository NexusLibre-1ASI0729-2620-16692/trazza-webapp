import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {BillingStore} from '../../../application/billing.store';
import {Plan} from '../../../domain/model/plan.entity';
import {planRangeText, SubscribeDialog} from '../../components/subscribe-dialog/subscribe-dialog';
import {FleetStore} from '../../../../iam/application/fleet.store';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {TrazzaMoneyPipe} from '../../../../shared/presentation/pipes/trazza-money.pipe';
import {statusKey} from '../../../../shared/presentation/formatters';

@Component({
  selector: 'app-plan-list',
  imports: [MatButton, TranslatePipe, StatusTag, TrazzaMoneyPipe],
  templateUrl: './plan-list.html',
  styles: `.plan-card { display: flex; flex-direction: column; gap: 0.5rem; } .grow { flex: 1; }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanList implements OnInit {
  protected readonly store = inject(BillingStore);
  private readonly fleet = inject(FleetStore);
  private readonly locale = inject(LocaleService);
  private readonly feedback = inject(FeedbackService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly key = statusKey;

  ngOnInit(): void {
    Promise.all([this.store.loadPlans(), this.fleet.loadFleet()]).catch(error => this.feedback.showError(error));
  }

  protected rangeText(plan: Plan): string {
    this.locale.language();
    return planRangeText(plan, this.locale);
  }

  protected choose(plan: Plan): void {
    this.dialog.open(SubscribeDialog, { data: plan, width: '32rem', maxWidth: '95vw' }).afterClosed().subscribe(subscribed => {
      if (subscribed) this.router.navigate(['/billing/subscriptions']).then();
    });
  }
}
