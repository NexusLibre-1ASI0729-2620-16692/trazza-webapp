import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';

import {FormsModule} from '@angular/forms';

import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-incident-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './incident-dialog.html',
  styleUrl: './incident-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentDialog {

  private readonly dialogRef = inject(
    MatDialogRef<IncidentDialog>
  );

  @Input({required: true})
  reporterId!: number;

  @Input({required: true})
  reporterRole!: 'carrier' | 'merchant';

  @Output()
  readonly incidentReported = new EventEmitter<{
    type: string;
    description: string;
    reporterId: number;
    reporterRole: 'carrier' | 'merchant';
  }>();

  selectedType = '';
  description = '';

  readonly incidentTypes = [
    {
      value: 'damaged_goods',
      label: 'Mercadería dañada'
    },
    {
      value: 'missing_items',
      label: 'Faltan artículos'
    },
    {
      value: 'delay',
      label: 'Retraso'
    },
    {
      value: 'vehicle_breakdown',
      label: 'Avería del vehículo'
    },
    {
      value: 'wrong_address',
      label: 'Dirección incorrecta'
    },
    {
      value: 'other',
      label: 'Otro'
    }
  ];

  get isValid(): boolean {
    return (
      this.selectedType.length > 0 &&
      this.description.trim().length >= 10 &&
      this.description.trim().length <= 500
    );
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }

    this.incidentReported.emit({
      type: this.selectedType,
      description: this.description.trim(),
      reporterId: this.reporterId,
      reporterRole: this.reporterRole
    });

    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
