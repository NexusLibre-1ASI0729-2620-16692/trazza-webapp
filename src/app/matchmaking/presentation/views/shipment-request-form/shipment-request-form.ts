import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatAnchor, MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {MatchmakingStore} from '../../../application/matchmaking.store';
import {CreateShipmentRequestCommand} from '../../../domain/commands/create-shipment-request.command';
import {FleetStore} from '../../../../iam/application/fleet.store';
import {emptyPlace, Place} from '../../../../shared/domain/model/place.value-object';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {MapPicker} from '../../../../shared/presentation/components/map-picker/map-picker';
import {fromLocalInputValue, toLocalInputValue} from '../return-route-form/return-route-form';

@Component({
  selector: 'app-shipment-request-form',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInput, MatAnchor, MatButton, MatIcon, TranslatePipe, MapPicker],
  templateUrl: './shipment-request-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShipmentRequestForm implements OnInit {
  protected readonly fleet = inject(FleetStore);
  private readonly store = inject(MatchmakingStore);
  private readonly feedback = inject(FeedbackService);
  private readonly router = inject(Router);

  protected readonly minDateTime = toLocalInputValue(new Date());
  protected readonly pickup = signal<Place>(emptyPlace());
  protected readonly delivery = signal<Place>(emptyPlace());
  protected readonly sending = signal(false);
  protected readonly form = inject(FormBuilder).group({
    description: [''],
    weightKg: [null as number | null],
    volumeM3: [null as number | null],
    pickupFrom: [''],
    pickupUntil: ['']
  });

  ngOnInit(): void {
    this.fleet.loadSavedAddresses().catch(error => this.feedback.showError(error));
  }

  protected async submit(): Promise<void> {
    const value = this.form.getRawValue();
    this.sending.set(true);
    const published = await this.feedback.attempt(() => this.store.createShipment(new CreateShipmentRequestCommand({
      description: value.description ?? '', weightKg: value.weightKg, volumeM3: value.volumeM3,
      pickupFrom: fromLocalInputValue(value.pickupFrom), pickupUntil: fromLocalInputValue(value.pickupUntil),
      pickup: this.pickup(), delivery: this.delivery()
    })), 'shipment.published');
    this.sending.set(false);
    if (published) await this.router.navigate(['/matchmaking/shipment-requests']);
  }
}
