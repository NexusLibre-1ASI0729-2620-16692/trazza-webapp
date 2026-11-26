import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideTranslateService} from '@ngx-translate/core';
import {IncidentPanel} from './incident-panel';
import {ExecutionStore} from '../../../application/execution.store';
import {Incident} from '../../../domain/model/incident.entity';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';

const incident = (id: number, status = 'OPEN'): Incident => new Incident({
  id, type: 'DAMAGED', description: 'Caja rota', status, reportedAt: '2026-11-12T10:00:00Z'
});

interface PanelInternals {
  reportForm: { setValue(value: { type: string; description: string }): void; getRawValue(): { description: string } };
  report(): Promise<void>;
}

describe('IncidentPanel', () => {
  let fixture: ComponentFixture<IncidentPanel>;
  let feedback: FeedbackService;
  const store = {
    listIncidents: jasmine.createSpy('listIncidents'),
    reportIncident: jasmine.createSpy('reportIncident'),
    addEvidence: jasmine.createSpy('addEvidence'),
    resolveIncident: jasmine.createSpy('resolveIncident')
  };

  const internals = () => fixture.componentInstance as unknown as PanelInternals;
  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    Object.values(store).forEach(spy => spy.calls.reset());
    store.listIncidents.and.resolveTo([]);
    store.reportIncident.and.resolveTo(incident(1));
    await TestBed.configureTestingModule({
      imports: [IncidentPanel],
      providers: [{ provide: ExecutionStore, useValue: store }, provideTranslateService()]
    }).compileComponents();
    feedback = TestBed.inject(FeedbackService);
    spyOn(feedback, 'showSuccess');
    spyOn(console, 'error');
    fixture = TestBed.createComponent(IncidentPanel);
    fixture.componentRef.setInput('tripId', 'trip-1');
  });

  it('loads the incidents of the trip when it opens', async () => {
    await render();
    expect(store.listIncidents).toHaveBeenCalledWith('trip-1');
  });

  it('shows one card for each incident of the trip', async () => {
    store.listIncidents.and.resolveTo([incident(1), incident(2, 'RESOLVED')]);
    await render();
    expect(fixture.nativeElement.querySelectorAll('.incident-card').length).toBe(2);
  });

  it('offers to report an incident only when the user can report', async () => {
    await render();
    expect(fixture.nativeElement.querySelector('button[mat-stroked-button]')).not.toBeNull();

    fixture.componentRef.setInput('canReport', false);
    await render();
    expect(fixture.nativeElement.querySelector('button[mat-stroked-button]')).toBeNull();
  });

  it('reports the incident with the trimmed description and reloads the list', async () => {
    await render();
    internals().reportForm.setValue({ type: 'DAMAGED', description: '  Dos cajas rotas  ' });
    await internals().report();
    expect(store.reportIncident).toHaveBeenCalledWith('trip-1', jasmine.objectContaining({ type: 'DAMAGED', description: 'Dos cajas rotas' }));
    expect(store.listIncidents).toHaveBeenCalledTimes(2);
    expect(internals().reportForm.getRawValue().description).toBe('');
  });

  it('does not call the store when the description is empty', async () => {
    await render();
    internals().reportForm.setValue({ type: 'DELAY', description: '   ' });
    await internals().report();
    expect(store.reportIncident).not.toHaveBeenCalled();
  });
});
