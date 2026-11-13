import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {ExecutionStore} from '../../../application/execution.store';
import {Shipment} from '../../../domain/model/shipment.entity';

@Component({
  selector: 'app-shipment-history',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './shipment-history.html',
  styleUrl: './shipment-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShipmentHistory implements OnInit {

  readonly executionStore = inject(ExecutionStore);

  searchTerm = '';

  ngOnInit(): void {
    this.executionStore.loadShipments();
  }

  get shipments(): Shipment[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.executionStore.finishedShipments()
      .filter(shipment => {

        if (!term) {
          return true;
        }

        return (
          shipment.code.toLowerCase().includes(term) ||
          shipment.carrierName.toLowerCase().includes(term) ||
          shipment.pickup.fullAddress.toLowerCase().includes(term) ||
          shipment.delivery.fullAddress.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const dateA = a.closedAt ?? a.deliveredAt ?? '';
        const dateB = b.closedAt ?? b.deliveredAt ?? '';

        return dateB.localeCompare(dateA);
      });
  }
}
