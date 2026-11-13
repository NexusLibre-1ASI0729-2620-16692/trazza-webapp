import {ChangeDetectionStrategy, Component, inject, input, OnInit, signal} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {ExecutionStore} from '../../../application/execution.store';
import {Incident, IncidentType} from '../../../domain/model/incident.entity';
import {ReportIncidentCommand} from '../../../domain/commands/report-incident.command';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';
import {statusKey} from '../../../../shared/presentation/formatters';

@Component({
  selector: 'app-incident-panel',
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInput, MatSelectModule, MatButton, MatIconButton, MatIcon,
    TranslatePipe, StatusTag, TrazzaDateTimePipe],
  templateUrl: './incident-panel.html',
  styles: `
    .incident-card { border: 1px solid var(--trazza-line); border-radius: 8px; padding: 0.75rem; }
    .grow { flex: 1; }
    .small-icon { font-size: 1rem; width: 1rem; height: 1rem; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentPanel implements OnInit {
  readonly tripId = input.required<string>();
  readonly canReport = input<boolean>(true);

  protected readonly locale = inject(LocaleService);
  private readonly store = inject(ExecutionStore);
  private readonly feedback = inject(FeedbackService);

  protected readonly types = Incident.TYPES;
  protected readonly incidents = signal<Incident[]>([]);
  protected readonly reporting = signal(false);
  protected readonly evidenceKeys: Record<number, string> = {};
  protected readonly resolutions: Record<number, string> = {};
  protected readonly reportForm = inject(FormBuilder).nonNullable.group({ type: ['DELAY' as IncidentType], description: [''] });
  protected readonly typeKey = statusKey;

  ngOnInit(): void {
    this.load().then();
  }

  protected async report(): Promise<void> {
    const reported = await this.feedback.attempt(
      () => this.store.reportIncident(this.tripId(), new ReportIncidentCommand(this.reportForm.getRawValue())), 'incident.reported');
    if (!reported) return;
    this.reportForm.controls.description.setValue('');
    this.reporting.set(false);
    await this.load();
  }

  protected async addEvidence(incident: Incident): Promise<void> {
    const added = await this.feedback.attempt(() => this.store.addEvidence(this.tripId(), incident.id, this.evidenceKeys[incident.id] ?? ''));
    if (!added) return;
    this.evidenceKeys[incident.id] = '';
    await this.load();
  }

  protected async resolve(incident: Incident): Promise<void> {
    const resolved = await this.feedback.attempt(
      () => this.store.resolveIncident(this.tripId(), incident.id, this.resolutions[incident.id] ?? ''), 'incident.resolved');
    if (resolved) await this.load();
  }

  private async load(): Promise<void> {
    try {
      this.incidents.set(await this.store.listIncidents(this.tripId()));
    } catch (error) {
      this.feedback.showError(error);
    }
  }
}
