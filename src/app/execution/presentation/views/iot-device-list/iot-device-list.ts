import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatAnchor} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {ExecutionStore} from '../../../application/execution.store';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {TrazzaDatePipe} from '../../../../shared/presentation/pipes/trazza-date.pipe';

@Component({
  selector: 'app-iot-device-list',
  imports: [RouterLink, MatTableModule, MatAnchor, TranslatePipe, StatusTag, EmptyState, TrazzaDatePipe],
  templateUrl: './iot-device-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IotDeviceList implements OnInit {
  protected readonly store = inject(ExecutionStore);
  protected readonly locale = inject(LocaleService);
  private readonly feedback = inject(FeedbackService);

  protected readonly loading = signal(true);
  protected readonly columns = ['serial', 'vehicle', 'loanedAt', 'status'];

  ngOnInit(): void {
    this.store.loadIotDevices()
      .catch(error => this.feedback.showError(error))
      .finally(() => this.loading.set(false));
  }
}
