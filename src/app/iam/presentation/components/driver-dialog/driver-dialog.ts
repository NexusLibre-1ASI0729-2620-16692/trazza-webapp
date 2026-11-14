import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {Driver, DriverSex} from '../../../domain/model/driver.entity';
import {FleetStore} from '../../../application/fleet.store';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {StarRating} from '../../../../shared/presentation/components/star-rating/star-rating';

@Component({
  selector: 'app-driver-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInput, MatSelectModule, MatButton, TranslatePipe, StarRating],
  templateUrl: './driver-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverDialog {
  protected readonly driver = inject<Driver>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DriverDialog, boolean>);
  private readonly store = inject(FleetStore);
  private readonly feedback = inject(FeedbackService);

  protected readonly sexOptions: { value: DriverSex | null; key: string }[] = [
    { value: null, key: 'driver.sex-none' }, { value: 'F', key: 'driver.sex-f' },
    { value: 'M', key: 'driver.sex-m' }, { value: 'X', key: 'driver.sex-x' }
  ];
  protected readonly stars = signal(this.driver.experienceStars);
  protected readonly form = inject(FormBuilder).group({
    fullName: [this.driver.fullName],
    sex: [this.driver.sex as DriverSex | null]
  });

  protected async save(): Promise<void> {
    const value = this.form.getRawValue();
    const fullName = (value.fullName ?? '').trim();
    const saved = await this.feedback.attempt(async () => {
      if (fullName.length < 3) throw new Error('validation.full-name-required');
      await this.store.saveDriver(new Driver({ ...this.driver, fullName, sex: value.sex, experienceStars: this.stars() }));
    }, 'driver.saved');
    if (saved) this.dialogRef.close(true);
  }
}
