import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatAnchor, MatIconAnchor, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {MatchmakingStore} from '../../../application/matchmaking.store';
import {ReturnRoute} from '../../../domain/model/return-route.entity';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {ConfirmDialog, ConfirmDialogData} from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import {TrazzaNumberPipe} from '../../../../shared/presentation/pipes/trazza-number.pipe';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';

@Component({
  selector: 'app-return-route-list',
  imports: [RouterLink, MatTableModule, MatAnchor, MatIconAnchor, MatIconButton, MatIcon, MatTooltip, TranslatePipe,
    StatusTag, EmptyState, TrazzaNumberPipe, TrazzaDateTimePipe],
  templateUrl: './return-route-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReturnRouteList implements OnInit {
  protected readonly store = inject(MatchmakingStore);
  protected readonly locale = inject(LocaleService);
  private readonly dialog = inject(MatDialog);
  private readonly feedback = inject(FeedbackService);

  protected readonly columns = ['route', 'departure', 'slots', 'capacity', 'status', 'actions'];

  ngOnInit(): void {
    this.store.loadCarrierData().catch(error => this.feedback.showError(error));
  }

  protected cancel(route: ReturnRoute): void {
    const data: ConfirmDialogData = {
      titleKey: 'return-route.cancel', messageKey: 'return-route.confirm-cancel', params: { route: route.label },
      confirmKey: 'return-route.cancel', danger: true
    };
    this.dialog.open(ConfirmDialog, { data }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.feedback.attempt(() => this.store.cancelRoute(route), 'return-route.cancelled').then();
    });
  }
}
