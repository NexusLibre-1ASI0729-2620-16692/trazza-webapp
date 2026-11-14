import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {FleetStore} from '../../../application/fleet.store';
import {SavedAddress} from '../../../domain/model/saved-address.entity';
import {assertPlace, emptyPlace, Place} from '../../../../shared/domain/model/place.value-object';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {MapPicker} from '../../../../shared/presentation/components/map-picker/map-picker';

@Component({
  selector: 'app-saved-address-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInput, MatButton, TranslatePipe, MapPicker],
  templateUrl: './saved-address-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavedAddressDialog {
  private readonly dialogRef = inject(MatDialogRef<SavedAddressDialog, boolean>);
  private readonly store = inject(FleetStore);
  private readonly feedback = inject(FeedbackService);

  protected readonly place = signal<Place>(emptyPlace());
  protected readonly form = inject(FormBuilder).nonNullable.group({ label: [''], district: [''] });

  protected async save(): Promise<void> {
    const { label, district } = this.form.getRawValue();
    const saved = await this.feedback.attempt(async () => {
      if (!label.trim()) throw new Error('validation.label-required');
      const place = assertPlace(this.place());
      await this.store.createSavedAddress(new SavedAddress({
        label: label.trim(), district: district.trim() || null, address: place.address,
        latitude: place.latitude!, longitude: place.longitude!
      }));
    }, 'saved-address.saved');
    if (saved) this.dialogRef.close(true);
  }
}
