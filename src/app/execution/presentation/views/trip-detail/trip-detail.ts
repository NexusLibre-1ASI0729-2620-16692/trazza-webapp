import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor, MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {ExecutionStore} from '../../../application/execution.store';
import {TripAction} from '../../../infrastructure/execution-api';
import {Trip} from '../../../domain/model/trip.entity';
import {TrackingPoint} from '../../../domain/model/tracking-point.entity';
import {DeviationAlert} from '../../../domain/model/deviation-alert.entity';
import {TripStatusChange} from '../../../domain/model/trip-status-change.entity';
import {IncidentPanel} from '../../components/incident-panel/incident-panel';
import {FleetStore} from '../../../../iam/application/fleet.store';
import {ReputationStore} from '../../../../reputation/application/reputation.store';
import {RatingDialog, RatingDialogData} from '../../../../reputation/presentation/components/rating-dialog/rating-dialog';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {startPolling} from '../../../../shared/presentation/services/polling';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {MapStop, RouteMap} from '../../../../shared/presentation/components/route-map/route-map';
import {ConfirmDialog, ConfirmDialogData} from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import {PromptDialog, PromptDialogData} from '../../../../shared/presentation/components/prompt-dialog/prompt-dialog';
import {TrazzaMoneyPipe} from '../../../../shared/presentation/pipes/trazza-money.pipe';
import {TrazzaNumberPipe} from '../../../../shared/presentation/pipes/trazza-number.pipe';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';
import {statusKey} from '../../../../shared/presentation/formatters';

/**
 * Follow one trip: map with the stops, the GPS track and the deviation alerts, status history, the actions each role
 * can take, live location sharing from the carrier's phone, incidents and the rating once it is confirmed.
 */
@Component({
  selector: 'app-trip-detail',
  imports: [RouterLink, MatAnchor, MatButton, MatIcon, MatFormFieldModule, MatSelectModule, TranslatePipe, StatusTag, RouteMap,
    IncidentPanel, TrazzaMoneyPipe, TrazzaNumberPipe, TrazzaDateTimePipe],
  templateUrl: './trip-detail.html',
  styles: `
    .timeline { list-style: none; margin: 0; padding: 0 0 0 1rem; border-left: 2px solid var(--trazza-line); }
    .timeline li { position: relative; display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: baseline; padding: 0.35rem 0; }
    .timeline li::before { content: ""; position: absolute; left: -1.4rem; top: 0.75rem; width: 0.6rem; height: 0.6rem;
      border-radius: 50%; background: var(--trazza-accent); }
    .alert-message { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
    .danger-text { color: #b91c1c; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripDetail implements OnInit {
  static readonly POLL_INTERVAL_MS = 15000;

  /** Route parameter. */
  readonly id = input.required<string>();

  protected readonly locale = inject(LocaleService);
  protected readonly fleet = inject(FleetStore);
  private readonly store = inject(ExecutionStore);
  private readonly reputation = inject(ReputationStore);
  private readonly feedback = inject(FeedbackService);
  private readonly dialog = inject(MatDialog);

  protected readonly trip = signal<Trip | null>(null);
  protected readonly track = signal<TrackingPoint[]>([]);
  protected readonly alerts = signal<DeviationAlert[]>([]);
  protected readonly history = signal<TripStatusChange[]>([]);
  protected readonly busy = signal(false);
  protected readonly sharing = signal(false);
  protected readonly key = statusKey;

  protected readonly openAlerts = computed(() => this.alerts().filter(alert => alert.isOpen));
  protected readonly canRate = computed(() => {
    const trip = this.trip();
    return !!trip && trip.status === 'CONFIRMED' && !this.reputation.hasRated(trip.id);
  });
  protected readonly stops = computed<MapStop[]>(() => {
    const trip = this.trip();
    if (!trip) return [];
    return [
      { label: this.locale.instant('fields.origin'), ...trip.origin, color: '#64748b' },
      { label: this.locale.instant('fields.pickup'), ...trip.pickup, color: '#0037b0' },
      { label: this.locale.instant('fields.delivery'), ...trip.delivery, color: '#16a34a' },
      { label: this.locale.instant('fields.destination'), ...trip.destination, color: '#64748b' }
    ];
  });

  private watchId: number | null = null;

  constructor() {
    startPolling(() => {
      if (this.trip()?.isActive) this.load().then();
    }, TripDetail.POLL_INTERVAL_MS);
    inject(DestroyRef).onDestroy(() => this.stopSharing());
  }

  async ngOnInit(): Promise<void> {
    await this.load();
    if (this.trip()?.isCarrier) this.fleet.loadFleet().catch(error => this.feedback.showError(error));
    this.reputation.loadRatings().catch(() => undefined);
  }

  protected ask(action: TripAction): void {
    const data: ConfirmDialogData = { titleKey: `trip.actions.${action}`, messageKey: `trip.confirm.${action}`, confirmKey: `trip.actions.${action}` };
    this.dialog.open(ConfirmDialog, { data }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.run(action).then();
    });
  }

  protected cancel(): void {
    const trip = this.trip();
    if (!trip) return;
    const data: PromptDialogData = {
      titleKey: 'trip.actions.cancel', labelKey: 'fields.reason', confirmKey: 'trip.actions.cancel', danger: true,
      messageKey: trip.cancellationMayCauseCompensation ? 'trip.lost-profit-warning' : undefined, warning: true
    };
    this.dialog.open(PromptDialog, { data, width: '30rem', maxWidth: '95vw' }).afterClosed().subscribe(async (reason: string | null) => {
      if (!reason) return;
      const cancelled = await this.feedback.attempt(async () => this.trip.set(await this.store.cancelTrip(trip, reason)), 'trip.done.cancel');
      if (cancelled) await this.load();
    });
  }

  protected async assignDriver(driverId: number | null): Promise<void> {
    const trip = this.trip();
    if (!trip) return;
    await this.feedback.attempt(async () => this.trip.set(await this.store.assignDriver(trip, driverId)), 'trip.driver-assigned');
  }

  protected async acknowledge(alert: DeviationAlert): Promise<void> {
    const trip = this.trip();
    if (!trip) return;
    const acknowledged = await this.feedback.attempt(() => this.store.acknowledgeAlert(trip.id, alert.id));
    if (acknowledged) await this.load();
  }

  protected rate(): void {
    const trip = this.trip();
    if (!trip) return;
    const data: RatingDialogData = { tripId: trip.id, counterpartName: trip.counterpart.name };
    this.dialog.open(RatingDialog, { data, width: '28rem', maxWidth: '95vw' });
  }

  /** Sends the phone's position as tracking points while the carrier is on the road. */
  protected toggleSharing(): void {
    if (this.sharing()) {
      this.stopSharing();
      return;
    }
    if (!navigator.geolocation) {
      this.feedback.showError(new Error('errors.geolocation-unavailable'));
      return;
    }
    this.sharing.set(true);
    this.watchId = navigator.geolocation.watchPosition(async ({ coords }) => {
      const trip = this.trip();
      if (!trip) return;
      try {
        const result = await this.store.recordTrackingPoint(trip.id, {
          latitude: coords.latitude,
          longitude: coords.longitude,
          speedKmh: coords.speed === null ? null : Math.round(coords.speed * 3.6 * 10) / 10
        });
        this.track.update(points => [...points, result.point]);
        if (result.alert) this.alerts.update(alerts => [result.alert!, ...alerts]);
      } catch (error) {
        this.feedback.showError(error);
        this.stopSharing();
      }
    }, () => {
      this.feedback.showError(new Error('errors.geolocation-denied'));
      this.stopSharing();
    }, { enableHighAccuracy: true, maximumAge: 10000 });
  }

  private stopSharing(): void {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
    this.sharing.set(false);
  }

  private async run(action: TripAction): Promise<void> {
    const trip = this.trip();
    if (!trip) return;
    this.busy.set(true);
    const done = await this.feedback.attempt(async () => this.trip.set(await this.store.runAction(trip, action)), `trip.done.${action}`);
    this.busy.set(false);
    if (!done) return;
    if (action === 'confirm') this.reputation.loadLoyalty().catch(() => undefined);
    await this.load();
  }

  private async load(): Promise<void> {
    try {
      const id = this.id();
      const [trip, track, alerts, history] = await Promise.all([
        this.store.getTrip(id), this.store.listTrackingPoints(id), this.store.listAlerts(id), this.store.getHistory(id)
      ]);
      this.trip.set(trip);
      this.track.set(track);
      this.alerts.set(alerts);
      this.history.set(history);
    } catch (error) {
      this.feedback.showError(error);
    }
  }
}
