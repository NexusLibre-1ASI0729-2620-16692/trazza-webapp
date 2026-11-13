import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgIf, NgFor } from '@angular/common';
import { ProfileStore } from '../../../application/profile.store';
import { VehicleCardComponent } from '../../components/vehicle-card/vehicle-card.component';
import { Vehicle } from '../../../domain/model/vehicle.entity';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, TranslatePipe, NgIf, NgFor, VehicleCardComponent],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css']
})
export class VehicleListComponent {
  private readonly router = inject(Router);
  private readonly profileStore = inject(ProfileStore);
  private readonly translate = inject(TranslateService);

  get vehicles(): Vehicle[] {
    return this.profileStore.currentCarrierProfile()?.vehicles ?? [];
  }

  navigateToNew() {
    this.router.navigate(['/iam/vehicles/new']);
  }

  navigateToEdit(vehicle: Vehicle) {
    this.router.navigate(['/iam/vehicles', vehicle.id, 'edit']);
  }

  async toggleVehicle(vehicle: Vehicle) {
    try {
      await this.profileStore.toggleVehicle(vehicle.id!);
    } catch (error) {
      alert(error); // In real app, use snackbar
    }
  }

  async confirmRemove(vehicle: Vehicle) {
    const message = this.translate.instant('vehicle.confirm-delete', { plate: vehicle.plate.value });
    if (window.confirm(message)) {
      try {
        await this.profileStore.removeVehicle(vehicle.id!);
      } catch (error) {
        alert(error);
      }
    }
  }
}
