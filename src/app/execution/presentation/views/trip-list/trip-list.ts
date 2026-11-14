import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconAnchor} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {ExecutionStore} from '../../../application/execution.store';
import {Trip} from '../../../domain/model/trip.entity';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {TrazzaMoneyPipe} from '../../../../shared/presentation/pipes/trazza-money.pipe';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';

type TripFilter = 'active' | 'closed' | 'all';

@Component({
  selector: 'app-trip-list',
  imports: [RouterLink, MatTableModule, MatButtonToggleModule, MatIconAnchor, MatIcon, MatTooltip, TranslatePipe, StatusTag,
    EmptyState, TrazzaMoneyPipe, TrazzaDateTimePipe],
  templateUrl: './trip-list.html',
  styles: `.alert-icon { color: #dc2626; font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripList implements OnInit {
  protected readonly store = inject(ExecutionStore);
  protected readonly locale = inject(LocaleService);
  private readonly feedback = inject(FeedbackService);
  private readonly router = inject(Router);

  protected readonly filter = signal<TripFilter>('active');
  protected readonly columns = ['shipment', 'counterpart', 'departure', 'rate', 'status', 'actions'];
  protected readonly trips = computed(() => this.store.trips().filter(trip =>
    this.filter() === 'all' || (this.filter() === 'active' ? trip.isActive : trip.isClosed)));

  ngOnInit(): void {
    this.store.loadTrips().catch(error => this.feedback.showError(error));
  }

  protected open(trip: Trip): void {
    this.router.navigate(['/execution/trips', trip.id]).then();
  }
}
