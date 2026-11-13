import {ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {MatchmakingStore} from '../../../application/matchmaking.store';
import {ReturnRoute} from '../../../domain/model/return-route.entity';
import {ShipmentRequest} from '../../../domain/model/shipment-request.entity';
import {OfferDialog, OfferDialogData} from '../../components/offer-dialog/offer-dialog';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {MapStop, RouteMap} from '../../../../shared/presentation/components/route-map/route-map';
import {TrazzaNumberPipe} from '../../../../shared/presentation/pipes/trazza-number.pipe';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';

/** One of the carrier's return routes and the open shipments that fit it (by detour, time window and capacity). */
@Component({
  selector: 'app-route-suggestions',
  imports: [MatTableModule, MatButton, TranslatePipe, StatusTag, EmptyState, RouteMap, TrazzaNumberPipe, TrazzaDateTimePipe],
  templateUrl: './route-suggestions.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteSuggestions implements OnInit {
  /** Route parameter. */
  readonly id = input.required<string>();

  protected readonly locale = inject(LocaleService);
  private readonly store = inject(MatchmakingStore);
  private readonly feedback = inject(FeedbackService);
  private readonly dialog = inject(MatDialog);

  protected readonly route = signal<ReturnRoute | null>(null);
  protected readonly suggestions = signal<ShipmentRequest[]>([]);
  protected readonly loading = signal(true);
  protected readonly columns = ['shipment', 'cargo', 'window', 'actions'];
  protected readonly stops = computed<MapStop[]>(() => {
    const route = this.route();
    if (!route) return [];
    return [
      { label: this.locale.instant('fields.origin'), ...route.origin, color: '#0037b0' },
      { label: this.locale.instant('fields.destination'), ...route.destination, color: '#001f66' }
    ];
  });

  ngOnInit(): void {
    this.load().then();
  }

  protected offer(shipment: ShipmentRequest): void {
    const route = this.route();
    if (!route) return;
    const data: OfferDialogData = { shipment, routes: [route], routeId: route.id };
    this.dialog.open(OfferDialog, { data, width: '34rem', maxWidth: '95vw' }).afterClosed().subscribe(proposal => {
      if (proposal) this.load().then();
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const route = await this.store.getRoute(this.id());
      this.route.set(route);
      this.suggestions.set(await this.store.suggestShipments(route.id));
    } catch (error) {
      this.feedback.showError(error);
    } finally {
      this.loading.set(false);
    }
  }
}
