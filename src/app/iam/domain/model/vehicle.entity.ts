import { LicensePlate } from './license-plate.value-object';
import { LoadCapacity } from './load-capacity.value-object';

export interface VehicleParams {
  id?: number | null;
  plate: LicensePlate;
  brandModel: string;
  bodyType: string;
  capacity: LoadCapacity;
  active?: boolean;
}

export class Vehicle {
  public static readonly BODY_TYPES = ['closed_van', 'flatbed', 'refrigerated', 'box_truck', 'pickup'] as const;
  private _id: number | null;
  private _plate: LicensePlate;
  private _brandModel: string;
  private _bodyType: string;
  private _capacity: LoadCapacity;
  private _active: boolean;

  constructor(params: VehicleParams) {
    if (!(params.plate instanceof LicensePlate)) throw new Error('validation.plate-invalid');
    if ((params.brandModel ?? '').trim().length < 2) throw new Error('validation.brand-model-required');
    if (!Vehicle.BODY_TYPES.includes(params.bodyType as any)) throw new Error('validation.body-type-invalid');
    if (!(params.capacity instanceof LoadCapacity)) throw new Error('validation.capacity-weight-invalid');

    this._id = params.id ?? null;
    this._plate = params.plate;
    this._brandModel = params.brandModel.trim();
    this._bodyType = params.bodyType;
    this._capacity = params.capacity;
    this._active = params.active ?? true;
  }

  get id(): number | null { return this._id; }
  get plate(): LicensePlate { return this._plate; }
  get brandModel(): string { return this._brandModel; }
  get bodyType(): string { return this._bodyType; }
  get capacity(): LoadCapacity { return this._capacity; }
  get active(): boolean { return this._active; }
  get label(): string { return `${this._brandModel} · ${this._plate.value}`; }

  assignId(id: number): void { this._id = id; }
  activate(): void { this._active = true; }
  deactivate(): void { this._active = false; }
}
