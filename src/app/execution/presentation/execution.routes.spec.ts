import {Route} from '@angular/router';
import {executionRoutes} from './execution.routes';
import {UserRole} from '../../iam/domain/model/user-role.value-object';

const route = (path: string): Route => executionRoutes.find(item => item.path === path) as Route;

describe('executionRoutes', () => {
  it('serves the trip list, the trip detail and the IoT devices', () => {
    expect(executionRoutes.map(item => item.path)).toEqual(['trips', 'trips/:id', 'iot-devices', '']);
  });

  it('opens the trip list when no path is given', () => {
    expect(route('').redirectTo).toBe('trips');
    expect(route('').pathMatch).toBe('full');
  });

  it('lets only carriers open the IoT devices', () => {
    expect(route('iot-devices').data).toEqual({ roles: [UserRole.CARRIER] });
    expect(route('trips').data).toBeUndefined();
  });

  it('gives every page a translated title key', () => {
    expect(route('trips').title).toBe('option.trips');
    expect(route('trips/:id').title).toBe('trip.detail-title');
    expect(route('iot-devices').title).toBe('option.iot-devices');
  });

  it('loads each view lazily', async () => {
    for (const path of ['trips', 'trips/:id', 'iot-devices']) {
      const component = await (route(path).loadComponent as () => Promise<unknown>)();
      expect(typeof component).toBe('function');
    }
  });
});
