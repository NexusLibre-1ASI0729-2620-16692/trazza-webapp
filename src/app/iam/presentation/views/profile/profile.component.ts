import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIf, NgClass } from '@angular/common';
import { IamStore } from '../../../application/iam.store';
import { ProfileStore } from '../../../application/profile.store';
import { initialsOf } from '../../../../shared/presentation/formatters';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    TranslatePipe,
    NgIf,
    NgClass
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  public readonly iamStore = inject(IamStore);
  public readonly profileStore = inject(ProfileStore);

  // Expose function to template
  initialsOf = initialsOf;

  profileForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    businessName: [''],
    phone: ['', [Validators.required, Validators.pattern('^9\\d{8}$')]]
  });

  saving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Computed Properties (Selectors)
  isCarrier = this.iamStore.isCarrier;
  
  verified = computed(() => {
    if (this.isCarrier()) {
      return this.profileStore.currentCarrierProfile()?.verified ?? false;
    }
    return this.profileStore.currentMerchantProfile()?.verified ?? false;
  });

  documentLabel = computed(() => this.isCarrier() ? 'fields.dni' : 'fields.ruc');
  
  documentValue = computed(() => {
    if (this.isCarrier()) {
      return this.profileStore.currentCarrierProfile()?.dni.value ?? '';
    }
    return this.profileStore.currentMerchantProfile()?.ruc.value ?? '';
  });

  displayName = computed(() => {
    if (this.isCarrier()) {
      return this.iamStore.currentUser()?.fullName ?? '';
    }
    return this.profileStore.currentMerchantProfile()?.businessName ?? '';
  });

  constructor() {
    effect(() => {
      // Sync form when state changes
      const user = this.iamStore.currentUser();
      const merchant = this.profileStore.currentMerchantProfile();
      
      this.profileForm.patchValue({
        fullName: user?.fullName ?? '',
        phone: user?.phone.value ?? '',
        businessName: merchant?.businessName ?? ''
      }, { emitEvent: false });
      
      if (!this.isCarrier()) {
        this.profileForm.get('businessName')?.setValidators([Validators.required]);
      } else {
        this.profileForm.get('businessName')?.clearValidators();
      }
      this.profileForm.get('businessName')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // If not loaded, fetch them (usually handled by a route guard or app initializer in full apps)
    if (!this.profileStore.loaded()) {
      this.profileStore.fetchProfiles();
    }
  }

  async saveProfile() {
    if (this.profileForm.invalid) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.saving.set(true);

    try {
      await this.profileStore.updateCurrentProfile({
        fullName: this.profileForm.value.fullName,
        businessName: this.profileForm.value.businessName,
        phone: this.profileForm.value.phone.replace(/\\s+/g, '') // remove spaces from formatted
      });
      this.successMessage.set('profile.saved');
      
      // Auto-hide success after 3 seconds
      setTimeout(() => this.successMessage.set(null), 3000);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Error updating profile');
    } finally {
      this.saving.set(false);
    }
  }
}
