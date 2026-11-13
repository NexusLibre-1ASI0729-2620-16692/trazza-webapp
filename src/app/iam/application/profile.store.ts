import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IamStore } from './iam.store';
import { ProfileApi } from '../infrastructure/profile-api.service';
import { CarrierProfile } from '../domain/model/carrier-profile.entity';
import { MerchantProfile } from '../domain/model/merchant-profile.entity';
import { Vehicle } from '../domain/model/vehicle.entity';
import { CarrierProfileAssembler } from '../infrastructure/carrier-profile-assembler';
import { MerchantProfileAssembler } from '../infrastructure/merchant-profile-assembler';
import { Dni } from '../domain/model/dni.value-object';
import { Ruc } from '../domain/model/ruc.value-object';
import { Phone } from '../domain/model/phone.value-object';
import { LicensePlate } from '../domain/model/license-plate.value-object';
import { LoadCapacity } from '../domain/model/load-capacity.value-object';
import { SignUpCommand } from '../domain/commands/sign-up.command';
import { User } from '../domain/model/user.entity';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly profileApi = inject(ProfileApi);
  private readonly iamStore = inject(IamStore);

  // State
  private readonly _carrierProfiles = signal<CarrierProfile[]>([]);
  private readonly _merchantProfiles = signal<MerchantProfile[]>([]);
  private readonly _loaded = signal<boolean>(false);
  private readonly _errors = signal<Error[]>([]);

  // Selectors
  readonly loaded = this._loaded.asReadonly();
  
  readonly currentCarrierProfile = computed(() => 
    this.getCarrierProfileByUserId(this.iamStore.currentUserId()!) ?? null
  );

  readonly currentMerchantProfile = computed(() => 
    this.getMerchantProfileByUserId(this.iamStore.currentUserId()!) ?? null
  );

  async fetchProfiles(): Promise<void> {
    try {
      const [carrierRes, merchantRes] = await Promise.all([
        firstValueFrom(this.profileApi.getCarrierProfiles()),
        firstValueFrom(this.profileApi.getMerchantProfiles())
      ]);
      this._carrierProfiles.set(CarrierProfileAssembler.toEntitiesFromResources(carrierRes));
      this._merchantProfiles.set(MerchantProfileAssembler.toEntitiesFromResources(merchantRes));
      this._loaded.set(true);
      this._errors.set([]);
    } catch (error: any) {
      this._errors.update(errs => [...errs, error]);
    }
  }


  carrierProfileOf(userId: number): CarrierProfile | undefined {
    return this.getCarrierProfileByUserId(userId);
  }

  merchantProfileOf(userId: number): MerchantProfile | undefined {
    return this.getMerchantProfileByUserId(userId);
  }

  loadProfiles(): Promise<void> {
    return this.fetchProfiles();
  }

  get activeVehicles() {
    return computed(() => {
      const profile = this.currentCarrierProfile();
      return profile ? profile.vehicles.filter(v => v.active) : [];
    });
  }

  findVehicle(vehicleId: number): Vehicle | undefined {
    const profile = this.currentCarrierProfile();
    return profile?.findVehicle(vehicleId);
  }

  getCarrierProfileByUserId(userId: number): CarrierProfile | undefined {
    return this._carrierProfiles().find(p => p.userId === userId);
  }

  getMerchantProfileByUserId(userId: number): MerchantProfile | undefined {
    return this._merchantProfiles().find(p => p.userId === userId);
  }

  displayNameOf(userId: number): string {
    return this.getCarrierProfileByUserId(userId)?.fullName 
        ?? this.getMerchantProfileByUserId(userId)?.businessName 
        ?? '';
  }

  async createProfileForUser(user: User, command: SignUpCommand): Promise<CarrierProfile | MerchantProfile> {
    if (user.isCarrier) {
      const profile = new CarrierProfile({
        userId: user.id!,
        fullName: command.fullName,
        dni: new Dni(command.dni!),
        phone: new Phone(command.phone)
      });
      const response = await firstValueFrom(this.profileApi.createCarrierProfile(
        CarrierProfileAssembler.toResourceFromEntity(profile)
      ));
      const created = CarrierProfileAssembler.toEntityFromResource(response);
      this._carrierProfiles.update(profiles => [...profiles, created]);
      return created;
    } else {
      const profile = new MerchantProfile({
        userId: user.id!,
        businessName: command.companyName!,
        contactName: command.fullName,
        ruc: new Ruc(command.ruc!),
        phone: new Phone(command.phone)
      });
      const response = await firstValueFrom(this.profileApi.createMerchantProfile(
        MerchantProfileAssembler.toResourceFromEntity(profile)
      ));
      const created = MerchantProfileAssembler.toEntityFromResource(response);
      this._merchantProfiles.update(profiles => [...profiles, created]);
      return created;
    }
  }

  async persistCarrierProfile(profile: CarrierProfile): Promise<void> {
    try {
      await firstValueFrom(this.profileApi.updateCarrierProfile(
        profile.id!, 
        CarrierProfileAssembler.toResourceFromEntity(profile)
      ));
      // Trigger reactivity
      this._carrierProfiles.update(profiles => [...profiles]);
    } catch (error: any) {
      this._errors.update(errs => [...errs, error]);
      await this.fetchProfiles();
      throw error;
    }
  }

  private buildVehicle(data: any): Vehicle {
    return new Vehicle({
      id: data.id ?? null,
      plate: new LicensePlate(data.plate),
      brandModel: data.brandModel,
      bodyType: data.bodyType,
      capacity: new LoadCapacity(data.capacityKg, data.volumeM3),
      active: data.active ?? true
    });
  }

  async addVehicle(data: any): Promise<Vehicle> {
    const profile = this.currentCarrierProfile();
    if (!profile) throw new Error('Profile not found');
    const vehicle = profile.addVehicle(this.buildVehicle(data));
    await this.persistCarrierProfile(profile);
    return vehicle;
  }

  async updateVehicle(data: any): Promise<void> {
    const profile = this.currentCarrierProfile();
    if (!profile) throw new Error('Profile not found');
    profile.updateVehicle(this.buildVehicle({ ...data, id: Number(data.id) }));
    await this.persistCarrierProfile(profile);
  }

  async toggleVehicle(vehicleId: number): Promise<void> {
    const profile = this.currentCarrierProfile();
    if (!profile) throw new Error('Profile not found');
    const vehicle = profile.findVehicle(vehicleId);
    if (!vehicle) throw new Error('validation.vehicle-not-found');
    if (vehicle.active) vehicle.deactivate(); else vehicle.activate();
    await this.persistCarrierProfile(profile);
  }

  async removeVehicle(vehicleId: number): Promise<void> {
    const profile = this.currentCarrierProfile();
    if (!profile) throw new Error('Profile not found');
    profile.removeVehicle(vehicleId);
    await this.persistCarrierProfile(profile);
  }

  async updateCurrentProfile(data: any): Promise<void> {
    const phone = new Phone(data.phone);
    if (this.iamStore.isCarrier()) {
      const profile = this.currentCarrierProfile();
      if (!profile) return;
      profile.updateContact({ fullName: data.fullName, phone });
      await this.persistCarrierProfile(profile);
    } else {
      const profile = this.currentMerchantProfile();
      if (!profile) return;
      profile.updateBusiness({ businessName: data.businessName, contactName: data.fullName, phone });
      await firstValueFrom(this.profileApi.updateMerchantProfile(
        profile.id!, 
        MerchantProfileAssembler.toResourceFromEntity(profile)
      ));
      this._merchantProfiles.update(profiles => [...profiles]);
    }
    await this.iamStore.updateCurrentUser({ fullName: data.fullName, phone: data.phone });
  }
}
