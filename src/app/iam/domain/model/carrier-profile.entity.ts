import { Dni } from './dni.value-object';
import { Phone } from './phone.value-object';
import { Vehicle } from './vehicle.entity';

export interface CarrierProfileParams {
  id?: number | null;
  userId: number;
  fullName: string;
  dni: Dni;
  phone: Phone;
  verified?: boolean;
  vehicles?: Vehicle[];
}

export class CarrierProfile {
  private _id: number | null;
  private _userId: number;
  private _fullName: string;
  private _dni: Dni;
  private _phone: Phone;
  private _verified: boolean;
  private _vehicles: Vehicle[];

  constructor(params: CarrierProfileParams) {
    if (!(params.dni instanceof Dni)) throw new Error('validation.dni-invalid');
    if (!(params.phone instanceof Phone)) throw new Error('validation.phone-invalid');

    this._id = params.id ?? null;
    this._userId = params.userId;
    this._fullName = params.fullName.trim();
    this._dni = params.dni;
    this._phone = params.phone;
    this._verified = params.verified ?? false;
    this._vehicles = params.vehicles ?? [];
  }

  get id(): number | null { return this._id; }
  get userId(): number { return this._userId; }
  get fullName(): string { return this._fullName; }
  get dni(): Dni { return this._dni; }
  get phone(): Phone { return this._phone; }
  get verified(): boolean { return this._verified; }
  get vehicles(): Vehicle[] { return this._vehicles; }

  updateContact({ fullName, phone }: { fullName: string; phone: Phone }): void {
    this._fullName = fullName.trim();
    this._phone = phone;
  }

  addVehicle(vehicle: Vehicle): Vehicle {
    const newId = this._vehicles.length > 0 ? Math.max(...this._vehicles.map(v => v.id ?? 0)) + 1 : 1;
    vehicle.assignId(newId);
    this._vehicles.push(vehicle);
    return vehicle;
  }

  updateVehicle(vehicle: Vehicle): void {
    const index = this._vehicles.findIndex(v => v.id === vehicle.id);
    if (index !== -1) {
      this._vehicles[index] = vehicle;
    }
  }

  findVehicle(vehicleId: number): Vehicle | undefined {
    return this._vehicles.find(v => v.id === vehicleId);
  }

  removeVehicle(vehicleId: number): void {
    this._vehicles = this._vehicles.filter(v => v.id !== vehicleId);
  }
}