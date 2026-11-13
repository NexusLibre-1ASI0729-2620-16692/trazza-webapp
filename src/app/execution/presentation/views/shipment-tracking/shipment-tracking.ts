import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {ExecutionStore} from '../../../application/execution.store';
import {Shipment} from '../../../domain/model/shipment.entity';

import {TrackingMap} from '../../components/tracking-map/tracking-map';
import {ShipmentTimeline} from '../../components/shipment-timeline/shipment-timeline';
import {IncidentDialog} from '../../components/incident-dialog/incident-dialog';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-shipment-tracking',
  standalone: true,
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TrackingMap,
    ShipmentTimeline
  ],
  templateUrl: './shipment-tracking.html',
  styleUrl: './shipment-tracking.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShipmentTracking implements OnInit {

  readonly executionStore = inject(ExecutionStore);

  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.executionStore.loadShipments();
  }

  get shipment(): Shipment | undefined {
    return this.executionStore.activeShipments()[0];
  }

  get etaLabel(): string {
    const shipment = this.shipment;

    if (!shipment) {
      return 'No disponible';
    }

    const minutes = shipment.etaMinutes;

    if (minutes <= 0) {
      return 'Llegando';
    }

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} h`;
    }

    return `${hours} h ${remainingMinutes} min`;
  }

  confirmReception(): void {
    const shipment = this.shipment;

    if (!shipment) {
      return;
    }

    this.executionStore.confirmReception(shipment).subscribe();
  }

  reportIncident(): void {
    const shipment = this.shipment;

    if (!shipment) {
      return;
    }

    const dialogRef = this.dialog.open(IncidentDialog, {
      width: '520px'
    });

    dialogRef.componentInstance.reporterId = shipment.merchantId;
    dialogRef.componentInstance.reporterRole = 'merchant';

    dialogRef.componentInstance.incidentReported.subscribe(data => {
      this.executionStore.reportIncident(shipment, data).subscribe();
    });
  }
}
