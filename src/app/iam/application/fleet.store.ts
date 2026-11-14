import {computed, inject, Injectable, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {IamApi} from '../infrastructure/iam-api';
import {Vehicle} from '../domain/model/vehicle.entity';
import {Driver} from '../domain/model/driver.entity';
import {SavedAddress} from '../domain/model/saved-address.entity';

/** The carrier's trucks and drivers, plus the saved addresses that both roles use. */
@Injectable({providedIn: 'root'})
export class FleetStore {
  private readonly iamApi = inject(IamApi);

  private readonly vehiclesSignal = signal<Vehicle[]>([]);
  private readonly driversSignal = signal<Driver[]>([]);
  private readonly savedAddressesSignal = signal<SavedAddress[]>([]);
  private readonly loadedSignal = signal(false);

  readonly vehicles = this.vehiclesSignal.asReadonly();
  readonly drivers = this.driversSignal.asReadonly();
  readonly savedAddresses = this.savedAddressesSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();
  readonly activeVehicles = computed(() => this.vehicles().filter(vehicle => vehicle.isActive));
  readonly activeDrivers = computed(() => this.drivers().filter(driver => driver.isActive));

  async loadFleet(): Promise<void> {
    const [vehicles, drivers] = await Promise.all([
      firstValueFrom(this.iamApi.vehicles.getAll()),
      firstValueFrom(this.iamApi.drivers.getAll())
    ]);
    this.vehiclesSignal.set(vehicles);
    this.driversSignal.set(drivers);
    this.loadedSignal.set(true);
  }

  async loadSavedAddresses(): Promise<void> {
    this.savedAddressesSignal.set(await firstValueFrom(this.iamApi.savedAddresses.getAll()));
  }

  async saveVehicle(vehicle: Vehicle): Promise<void> {
    if (vehicle.id) await firstValueFrom(this.iamApi.vehicles.update(vehicle, vehicle.id));
    else await firstValueFrom(this.iamApi.vehicles.create(vehicle));
    await this.loadFleet();
  }

  async deactivateVehicle(vehicle: Vehicle): Promise<void> {
    await firstValueFrom(this.iamApi.vehicles.delete(vehicle.id));
    await this.loadFleet();
  }

  async saveDriver(driver: Driver): Promise<void> {
    if (driver.id) await firstValueFrom(this.iamApi.drivers.update(driver, driver.id));
    else await firstValueFrom(this.iamApi.drivers.create(driver));
    await this.loadFleet();
  }

  async deactivateDriver(driver: Driver): Promise<void> {
    await firstValueFrom(this.iamApi.drivers.delete(driver.id));
    await this.loadFleet();
  }

  async createSavedAddress(address: SavedAddress): Promise<void> {
    await firstValueFrom(this.iamApi.savedAddresses.create(address));
    await this.loadSavedAddresses();
  }

  async deleteSavedAddress(address: SavedAddress): Promise<void> {
    await firstValueFrom(this.iamApi.savedAddresses.delete(address.id));
    await this.loadSavedAddresses();
  }
}
