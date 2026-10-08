import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatChipsModule} from '@angular/material/chips';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {MatchmakingStore} from '../../../application/matchmaking.store';
import {ReturnRoute} from '../../../domain/model/return-route.entity';
import {CargoType} from '../../../domain/model/cargo-type.value-object';
import {RouteMatchingService, TripEstimation} from '../../../domain/services/route-matching.service';
import {RoutePreview} from '../../components/route-preview/route-preview';
import {ProfileStore} from '../../../../iam/application/profile.store';
import {BillingStore} from '../../../../billing/application/billing.store';
import {Address} from '../../../../shared/domain/model/address.value-object';
import {AddressFields} from '../../../../shared/presentation/components/address-fields/address-fields';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {halfHourSlots, toIsoDate} from '../../../../shared/presentation/formatters';
import {TrazzaNumberPipe} from '../../../../shared/presentation/pipes/trazza-number.pipe';

@Component({
  selector: 'app-return-route-form',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInput, MatSelectModule, MatDatepickerModule, MatChipsModule, MatButton, MatIcon, TranslatePipe, AddressFields, RoutePreview, TrazzaNumberPipe],
  templateUrl: './return-route-form.html',
  styleUrl: './return-route-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReturnRouteForm extends BaseForm {
  private readonly store = inject(MatchmakingStore);
  private readonly profileStore = inject(ProfileStore);
  private readonly billingStore = inject(BillingStore);
  private readonly router = inject(Router);
  private readonly feedback = inject(FeedbackService);
  private readonly fb = inject(FormBuilder);

  protected readonly today = new Date(new Date().setHours(0, 0, 0, 0));
  protected readonly timeSlots = halfHourSlots();
  protected readonly detourOptions = ReturnRoute.DETOUR_OPTIONS;
  protected readonly cargoTypes = CargoType.VALUES;
  protected readonly vehicles = this.profileStore.activeVehicles;

  protected readonly form = this.fb.nonNullable.group({
    origin: this.fb.nonNullable.group({ street: ['', Validators.required], district: ['', Validators.required] }),
    destination: this.fb.nonNullable.group({ street: ['', Validators.required], district: ['', Validators.required] }),
    departureDate: [this.today as Date | null, Validators.required],
    start: ['16:00', Validators.required],
    end: ['18:00', Validators.required],
    vehicleId: [0, Validators.min(1)],
    availableWeightKg: [0, [Validators.required, Validators.min(1)]],
    availableVolumeM3: [0, Validators.min(0)],
    maxDetourKm: [15, Validators.required],
    acceptedCargoTypes: [['general'] as string[], Validators.required]
  });

  protected readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly selectedVehicle = computed(() => this.vehicles().find(vehicle => vehicle.id === this.formValue().vehicleId) ?? null);

  protected readonly exceedsVehicle = computed(() => {
    const vehicle = this.selectedVehicle();
    return !!vehicle && (this.formValue().availableWeightKg ?? 0) > vehicle.capacity.weightKg;
  });

  protected readonly limitReached = computed(() => !this.billingStore.canPublish(this.store.publicationsThisMonth()));

  protected readonly estimation = computed<TripEstimation | null>(() => {
    const value = this.formValue();
    try {
      return RouteMatchingService.estimateTrip(
        new Address({ street: value.origin?.street ?? '', district: value.origin?.district ?? '' }),
        new Address({ street: value.destination?.street ?? '', district: value.destination?.district ?? '' }));
    } catch {
      return null;
    }
  });

  protected readonly saving = signal(false);

  protected readonly errorMessage = signal('');

  constructor() {
    super();
    effect(() => {
      const vehicles = this.vehicles();
      if (!this.form.controls.vehicleId.value && vehicles.length) {
        const vehicle = vehicles[0];
        this.form.patchValue({ vehicleId: vehicle.id!, availableWeightKg: vehicle.capacity.weightKg, availableVolumeM3: vehicle.capacity.volumeM3 });
      }
    });
  }

  protected submit(): void {
    this.errorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set(this.feedback.describeError(new Error('validation.form-incomplete')));
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.store.publishReturnRoute({
      vehicleId: value.vehicleId,
      origin: value.origin,
      destination: value.destination,
      departureDate: value.departureDate ? toIsoDate(value.departureDate) : '',
      timeWindow: { start: value.start, end: value.end },
      availableWeightKg: value.availableWeightKg,
      availableVolumeM3: value.availableVolumeM3,
      maxDetourKm: value.maxDetourKm,
      acceptedCargoTypes: value.acceptedCargoTypes
    }).subscribe({
      next: route => {
        this.saving.set(false);
        this.feedback.showSuccess('return-route.published');
        this.router.navigate(['/matchmaking/load-suggestions'], { queryParams: { routeId: route.id } }).then();
      },
      error: error => {
        this.saving.set(false);
        this.errorMessage.set(this.feedback.describeError(error));
      }
    });
  }

  protected cancel(): void {
    this.router.navigate(['/matchmaking/return-routes']).then();
  }
}
