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

@Component({
  selector: 'app-active-trip',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TrackingMap,
    ShipmentTimeline
  ],
  templateUrl: './active-trip.html',
  styleUrl: './active-trip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActiveTrip implements OnInit {

  readonly executionStore = inject(ExecutionStore);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.executionStore.loadShipments();
  }

  get shipment(): Shipment | undefined {
    return this.executionStore.activeShipments()[0];
  }

  confirmPickup(): void {
    const shipment = this.shipment;

    if (!shipment) {
      return;
    }

    this.executionStore.confirmPickup(shipment).then();
  }

  confirmDelivery(): void {
    const shipment = this.shipment;

    if (!shipment) {
      return;
    }

    try {
      this.executionStore.confirmDelivery(shipment).then();
    } catch (error) {
      console.error('Unable to confirm delivery', error);
    }
  }

  updateLocation(): void {
    const shipment = this.shipment;

    if (!shipment?.currentLocation) {
      return;
    }

    this.executionStore
      .shareLocation(shipment, shipment.currentLocation)
      .subscribe();
  }

  reportIncident(): void {
    const shipment = this.shipment;

    if (!shipment) {
      return;
    }

    const dialogRef = this.dialog.open<IncidentDialog>(
      IncidentDialog,
      {
        width: '520px'
      }
    );

    dialogRef.componentInstance.reporterId = shipment.carrierId;
    dialogRef.componentInstance.reporterRole = 'carrier';

    dialogRef.componentInstance.incidentReported.subscribe(data => {
      this.executionStore.reportIncident(shipment, data).subscribe();
    });
  }
}
