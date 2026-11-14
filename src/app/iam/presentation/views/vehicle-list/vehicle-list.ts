import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {FleetStore} from '../../../application/fleet.store';
import {Vehicle} from '../../../domain/model/vehicle.entity';
import {VehicleDialog} from '../../components/vehicle-dialog/vehicle-dialog';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {ConfirmDialog, ConfirmDialogData} from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import {TrazzaNumberPipe} from '../../../../shared/presentation/pipes/trazza-number.pipe';

@Component({
  selector: 'app-vehicle-list',
  imports: [MatTableModule, MatButton, MatIconButton, MatIcon, TranslatePipe, StatusTag, EmptyState, TrazzaNumberPipe],
  templateUrl: './vehicle-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleList implements OnInit {
  protected readonly store = inject(FleetStore);
  private readonly dialog = inject(MatDialog);
  private readonly feedback = inject(FeedbackService);

  protected readonly columns = ['plate', 'model', 'maxLoad', 'volume', 'status', 'actions'];

  ngOnInit(): void {
    this.store.loadFleet().catch(error => this.feedback.showError(error));
  }

  protected open(vehicle: Vehicle | null = null): void {
    this.dialog.open(VehicleDialog, { data: new Vehicle(vehicle ?? {}), width: '34rem', maxWidth: '95vw' });
  }

  protected deactivate(vehicle: Vehicle): void {
    const data: ConfirmDialogData = {
      titleKey: 'vehicle.deactivate', messageKey: 'vehicle.confirm-deactivate', params: { plate: vehicle.plate },
      confirmKey: 'vehicle.deactivate', danger: true
    };
    this.dialog.open(ConfirmDialog, { data }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.feedback.attempt(() => this.store.deactivateVehicle(vehicle), 'vehicle.deactivated').then();
    });
  }
}
