import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {Vehicle} from '../../../domain/model/vehicle.entity';
import {LicensePlate} from '../../../domain/model/license-plate.value-object';
import {FleetStore} from '../../../application/fleet.store';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';

@Component({
  selector: 'app-vehicle-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInput, MatButton, TranslatePipe],
  templateUrl: './vehicle-dialog.html',
  styles: `.grid-dims { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 0.75rem; }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleDialog {
  protected readonly vehicle = inject<Vehicle>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<VehicleDialog, boolean>);
  private readonly store = inject(FleetStore);
  private readonly feedback = inject(FeedbackService);

  protected readonly form = inject(FormBuilder).group({
    plate: [this.vehicle.plate],
    model: [this.vehicle.model],
    maxLoadKg: [this.vehicle.maxLoadKg as number | null],
    cargoVolumeM3: [this.vehicle.cargoVolumeM3 as number | null],
    cargoLengthM: [this.vehicle.cargoLengthM as number | null],
    cargoWidthM: [this.vehicle.cargoWidthM as number | null],
    cargoHeightM: [this.vehicle.cargoHeightM as number | null]
  });

  protected async save(): Promise<void> {
    const value = this.form.getRawValue();
    const saved = await this.feedback.attempt(() => this.store.saveVehicle(new Vehicle({
      ...this.vehicle,
      plate: new LicensePlate(value.plate).value,
      model: (value.model ?? '').trim(),
      maxLoadKg: Number(value.maxLoadKg ?? 0),
      cargoVolumeM3: value.cargoVolumeM3 ? Number(value.cargoVolumeM3) : null,
      cargoLengthM: Number(value.cargoLengthM ?? 0),
      cargoWidthM: Number(value.cargoWidthM ?? 0),
      cargoHeightM: Number(value.cargoHeightM ?? 0)
    })), 'vehicle.saved');
    if (saved) this.dialogRef.close(true);
  }
}
