import {ComponentFixture, TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideTranslateService} from '@ngx-translate/core';
import {IotDeviceList} from './iot-device-list';
import {ExecutionStore} from '../../../application/execution.store';
import {IotDevice} from '../../../domain/model/iot-device.entity';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';

const device = (id: number, serialNumber: string, vehiclePlate: string | null): IotDevice => ({
  id, serialNumber, status: 'LOANED', vehicleId: vehiclePlate ? `v-${id}` : null, vehiclePlate, loanedAt: '2026-11-01T09:00:00Z'
});

describe('IotDeviceList', () => {
  let fixture: ComponentFixture<IotDeviceList>;
  const iotDevices = signal<IotDevice[]>([]);
  const store = { iotDevices, loadIotDevices: jasmine.createSpy('loadIotDevices') };

  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    iotDevices.set([]);
    store.loadIotDevices.calls.reset();
    store.loadIotDevices.and.resolveTo();
    await TestBed.configureTestingModule({
      imports: [IotDeviceList],
      providers: [{ provide: ExecutionStore, useValue: store }, provideRouter([]), provideTranslateService()]
    }).compileComponents();
    fixture = TestBed.createComponent(IotDeviceList);
  });

  it('asks the store for the loaned devices when it opens', async () => {
    await render();
    expect(store.loadIotDevices).toHaveBeenCalledTimes(1);
  });

  it('shows one row per loaned device with its serial number and plate', async () => {
    iotDevices.set([device(1, 'TRZ-001', 'T5K-123'), device(2, 'TRZ-002', null)]);
    await render();
    const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('tr[mat-row]'));
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('TRZ-001');
    expect(rows[0].textContent).toContain('T5K-123');
    expect(rows[1].textContent).toContain('—');
  });

  it('shows the empty state when the carrier has no device', async () => {
    await render();
    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
  });

  it('reports the error and stops loading when the devices cannot be fetched', async () => {
    const failure = new Error('errors.network');
    store.loadIotDevices.and.rejectWith(failure);
    const showError = spyOn(TestBed.inject(FeedbackService), 'showError');
    await render();
    expect(showError).toHaveBeenCalledWith(failure);
  });
});
