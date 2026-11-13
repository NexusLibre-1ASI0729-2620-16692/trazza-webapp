import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatAnchor, MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {MatchmakingStore} from '../../../application/matchmaking.store';
import {CreateReturnRouteCommand} from '../../../domain/commands/create-return-route.command';
import {FleetStore} from '../../../../iam/application/fleet.store';
import {emptyPlace, Place} from '../../../../shared/domain/model/place.value-object';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {MapPicker} from '../../../../shared/presentation/components/map-picker/map-picker';

/** "YYYY-MM-DDTHH:mm" in local time, the format of datetime-local inputs. */
export const toLocalInputValue = (date: Date): string => {
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const fromLocalInputValue = (value: string | null | undefined): Date | null => value ? new Date(value) : null;

@Component({
  selector: 'app-return-route-form',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInput, MatSelectModule, MatButtonToggleModule, MatAnchor,
    MatButton, MatIcon, TranslatePipe, MapPicker],
  templateUrl: './return-route-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReturnRouteForm implements OnInit {
  protected readonly fleet = inject(FleetStore);
  private readonly store = inject(MatchmakingStore);
  private readonly feedback = inject(FeedbackService);
  private readonly router = inject(Router);

  protected readonly minDateTime = toLocalInputValue(new Date());
  protected readonly origin = signal<Place>(emptyPlace());
  protected readonly destination = signal<Place>(emptyPlace());
  protected readonly sending = signal(false);
  protected readonly form = inject(FormBuilder).group({
    vehicleId: [null as string | null],
    driverId: [null as number | null],
    departureAt: [''],
    maxShipments: [2]
  });

  ngOnInit(): void {
    Promise.all([this.fleet.loadFleet(), this.fleet.loadSavedAddresses()]).then(() => {
      if (!this.form.controls.vehicleId.value) this.form.controls.vehicleId.setValue(this.fleet.activeVehicles()[0]?.id ?? null);
    }).catch(error => this.feedback.showError(error));
  }

  protected async submit(): Promise<void> {
    const value = this.form.getRawValue();
    this.sending.set(true);
    let routeId: string | null = null;
    await this.feedback.attempt(async () => {
      const route = await this.store.createRoute(new CreateReturnRouteCommand({
        vehicleId: value.vehicleId, driverId: value.driverId, departureAt: fromLocalInputValue(value.departureAt),
        maxShipments: value.maxShipments ?? 2, origin: this.origin(), destination: this.destination()
      }));
      routeId = route.id;
    }, 'return-route.published');
    this.sending.set(false);
    if (routeId) await this.router.navigate(['/matchmaking/return-routes', routeId]);
  }
}
