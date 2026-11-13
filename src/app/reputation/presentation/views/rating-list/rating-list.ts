import {ChangeDetectionStrategy, Component, computed, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import {TranslatePipe} from '@ngx-translate/core';
import {ReputationStore} from '../../../application/reputation.store';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StarRating} from '../../../../shared/presentation/components/star-rating/star-rating';
import {TrazzaDatePipe} from '../../../../shared/presentation/pipes/trazza-date.pipe';

@Component({
  selector: 'app-rating-list',
  imports: [RouterLink, MatTabsModule, TranslatePipe, StarRating, TrazzaDatePipe],
  templateUrl: './rating-list.html',
  styles: `.summary { gap: 1rem; } .rating-row { padding: 0.75rem 0; }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingList implements OnInit {
  protected readonly store = inject(ReputationStore);
  protected readonly locale = inject(LocaleService);
  private readonly feedback = inject(FeedbackService);

  protected readonly tabs = ['received', 'given'] as const;
  protected readonly roundedAverage = computed(() => Math.round(this.store.averageScore() ?? 0));

  ngOnInit(): void {
    this.store.loadRatings().catch(error => this.feedback.showError(error));
  }
}
