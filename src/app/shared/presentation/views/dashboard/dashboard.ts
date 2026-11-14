import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../../iam/application/iam.store';
import {MatchmakingStore} from '../../../../matchmaking/application/matchmaking.store';
import {ExecutionStore} from '../../../../execution/application/execution.store';
import {ReputationStore} from '../../../../reputation/application/reputation.store';
import {LocaleService} from '../../services/locale.service';
import {StatusTag} from '../../components/status-tag/status-tag';
import {TrazzaDateTimePipe} from '../../pipes/trazza-date-time.pipe';

interface DashboardCard {
  label: string;
  value: number;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatAnchor, MatIcon, TranslatePipe, StatusTag, TrazzaDateTimePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
  protected readonly iamStore = inject(IamStore);
  protected readonly executionStore = inject(ExecutionStore);
  protected readonly locale = inject(LocaleService);
  private readonly matchmakingStore = inject(MatchmakingStore);
  private readonly reputationStore = inject(ReputationStore);
  private readonly router = inject(Router);

  protected readonly user = this.iamStore.currentUser;
  protected readonly firstName = computed(() => (this.user()?.fullName ?? '').split(' ')[0]);

  protected readonly cards = computed<DashboardCard[]>(() => this.iamStore.isCarrier() ? [
    { label: 'dashboard.open-routes', value: this.matchmakingStore.openRoutes().length, icon: 'alt_route', link: '/matchmaking/return-routes' },
    { label: 'dashboard.open-shipments', value: this.matchmakingStore.openShipments().length, icon: 'inventory_2', link: '/matchmaking/open-shipments' },
    { label: 'dashboard.pending-proposals', value: this.matchmakingStore.pendingProposals().length, icon: 'forum', link: '/matchmaking/proposals' },
    { label: 'dashboard.active-trips', value: this.executionStore.activeTrips().length, icon: 'local_shipping', link: '/execution/trips' }
  ] : [
    { label: 'dashboard.my-open-shipments', value: this.matchmakingStore.myOpenShipments().length, icon: 'inventory_2', link: '/matchmaking/shipment-requests' },
    { label: 'dashboard.offers-received', value: this.matchmakingStore.pendingProposals().length, icon: 'inbox', link: '/matchmaking/proposals' },
    { label: 'dashboard.active-trips', value: this.executionStore.activeTrips().length, icon: 'location_on', link: '/execution/trips' },
    { label: 'dashboard.points', value: this.reputationStore.loyalty().balance, icon: 'redeem', link: '/reputation/points' }
  ]);

  protected open(link: string): void {
    this.router.navigateByUrl(link).then();
  }
}
