/**
 * A monitoring plan for carriers: route planning per truck, IoT per truck (a GPS device is loaned) or a fleet
 * package with a fixed price for a range of trucks.
 */
export class Plan {
  code: string;
  name: string;
  monitoringType: string;
  pricingUnit: string;
  price: number;
  currency: string;
  billingPeriod: string;
  minVehicles: number;
  maxVehicles: number | null;
  includesIotDevice: boolean;

  constructor(props: {
    code: string; name: string; monitoringType: string; pricingUnit: string; price: number; currency: string;
    billingPeriod: string; minVehicles: number; maxVehicles?: number | null; includesIotDevice: boolean;
  }) {
    this.code = props.code;
    this.name = props.name;
    this.monitoringType = props.monitoringType;
    this.pricingUnit = props.pricingUnit;
    this.price = props.price;
    this.currency = props.currency;
    this.billingPeriod = props.billingPeriod;
    this.minVehicles = props.minVehicles;
    this.maxVehicles = props.maxVehicles ?? null;
    this.includesIotDevice = props.includesIotDevice;
  }

  get isPackage(): boolean {
    return this.pricingUnit === 'PACKAGE';
  }

  acceptsVehicleCount(count: number): boolean {
    return count >= this.minVehicles && (this.maxVehicles === null || count <= this.maxVehicles);
  }

  priceFor(count: number): number {
    return this.isPackage ? this.price : this.price * count;
  }
}
