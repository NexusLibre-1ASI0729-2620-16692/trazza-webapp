import {Plan} from './plan.entity';

const plan = (pricingUnit: string, minVehicles: number, maxVehicles: number | null, price: number) => new Plan({
  code: 'P', name: 'Plan', monitoringType: 'ROUTE', pricingUnit, price, currency: 'USD', billingPeriod: 'MONTHLY',
  minVehicles, maxVehicles, includesIotDevice: false
});

describe('Plan', () => {
  it('charges per truck', () => {
    const perTruck = plan('PER_VEHICLE', 1, null, 10);
    expect(perTruck.priceFor(3)).toBe(30);
    expect(perTruck.acceptsVehicleCount(0)).toBeFalse();
    expect(perTruck.acceptsVehicleCount(40)).toBeTrue();
  });

  it('charges a fixed price for a package within its range of trucks', () => {
    const pack = plan('PACKAGE', 5, 6, 200);
    expect(pack.priceFor(5)).toBe(200);
    expect(pack.acceptsVehicleCount(4)).toBeFalse();
    expect(pack.acceptsVehicleCount(6)).toBeTrue();
    expect(pack.acceptsVehicleCount(7)).toBeFalse();
  });
});
