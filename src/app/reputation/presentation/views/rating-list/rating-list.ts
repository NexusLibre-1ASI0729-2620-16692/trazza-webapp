import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {ReputationStore} from '../../../application/reputation.store';
import {StarRating} from '../../components/star-rating/star-rating';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {InitialsPipe} from '../../../../shared/presentation/pipes/initials.pipe';
import {TrazzaDatePipe} from '../../../../shared/presentation/pipes/trazza-date.pipe';

type RatingView = 'received' | 'given';

@Component({
  selector: 'app-rating-list',
  imports: [MatButtonToggleModule, MatProgressBar, MatIcon, TranslatePipe, StarRating, EmptyState, StatusTag, InitialsPipe, TrazzaDatePipe],
  templateUrl: './rating-list.html',
  styleUrl: './rating-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingList {
  protected readonly store = inject(ReputationStore);
  protected readonly locale = inject(LocaleService);

  protected readonly view = signal<RatingView>('received');

  protected readonly summary = this.store.mySummary;

  protected readonly starLevels = [5, 4, 3, 2, 1];

  protected readonly ratings = computed(() => this.view() === 'received' ? this.store.myReceivedRatings() : this.store.myGivenRatings());

  protected percentage(stars: number): number {
    const summary = this.summary();
    return summary.count ? Math.round(summary.distribution[stars - 1] / summary.count * 100) : 0;
  }
}
