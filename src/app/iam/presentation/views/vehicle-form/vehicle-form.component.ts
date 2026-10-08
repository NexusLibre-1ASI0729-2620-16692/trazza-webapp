import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIf, NgFor } from '@angular/common';
import { ProfileStore } from '../../../application/profile.store';
import { Vehicle } from '../../../domain/model/vehicle.entity';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    TranslatePipe,
    NgIf,
    NgFor
  ],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.css']
})
export class VehicleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly profileStore = inject(ProfileStore);

  isEdit = false;
  vehicleId: number | null = null;
  errorMessage = signal<string | null>(null);
  saving = signal(false);

  // According to original code, Vehicle has static BODY_TYPES (mocked here based on typical Vue usage)
  bodyTypes = ['closed_van', 'flatbed', 'refrigerated', 'curtainsider', 'tanker'];

  vehicleForm: FormGroup = this.fb.group({
    plate: ['', [Validators.required, Validators.pattern('^[A-Z0-9]{3}-[A-Z0-9]{3,4}$')]],
    brandModel: ['', Validators.required],
    bodyType: ['closed_van', Validators.required],
    capacityKg: [null, [Validators.required, Validators.min(0)]],
    volumeM3: [null, [Validators.required, Validators.min(0)]],
    active: [true]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.vehicleId = Number(idParam);
      this.loadVehicle();
    }
  }

  loadVehicle() {
    const vehicle = this.profileStore.currentCarrierProfile()?.findVehicle(this.vehicleId!);
    if (vehicle) {
      this.vehicleForm.patchValue({
        plate: vehicle.plate.value,
        brandModel: vehicle.brandModel,
        bodyType: vehicle.bodyType,
        capacityKg: vehicle.capacity.weightKg,
        volumeM3: vehicle.capacity.volumeM3,
        active: vehicle.active
      });
    }
  }

  async saveVehicle() {
    if (this.vehicleForm.invalid) return;
    this.saving.set(true);
    this.errorMessage.set(null);
    
    try {
      const data = { ...this.vehicleForm.value, id: this.vehicleId };
      if (this.isEdit) {
        await this.profileStore.updateVehicle(data);
      } else {
        await this.profileStore.addVehicle(data);
      }
      this.navigateBack();
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Error saving vehicle');
    } finally {
      this.saving.set(false);
    }
  }

  navigateBack() {
    this.router.navigate(['/iam/vehicles']);
  }
}
