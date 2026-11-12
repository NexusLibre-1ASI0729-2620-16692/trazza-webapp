import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';

export interface PromptDialogData {
  titleKey: string;
  labelKey: string;
  messageKey?: string;
  params?: Record<string, string | number>;
  confirmKey?: string;
  required?: boolean;
  danger?: boolean;
  warning?: boolean;
  maxLength?: number;
}

/** Asks for one short text, for example a cancellation reason or a payment reference. Closes with the text or null. */
@Component({
  selector: 'app-prompt-dialog',
  imports: [MatDialogModule, MatButton, MatFormFieldModule, MatInput, ReactiveFormsModule, TranslatePipe],
  templateUrl: './prompt-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromptDialog {
  protected readonly data = inject<PromptDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PromptDialog, string | null>);

  protected readonly text = new FormControl('', {
    nonNullable: true,
    validators: [
      ...(this.data.required === false ? [] : [Validators.required]),
      Validators.maxLength(this.data.maxLength ?? 255)
    ]
  });

  protected submit(): void {
    if (this.text.invalid || (this.data.required !== false && !this.text.value.trim())) {
      this.text.markAsTouched();
      return;
    }
    this.dialogRef.close(this.text.value.trim());
  }
}
