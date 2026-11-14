import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {Severity, statusKey, statusSeverity} from '../../formatters';

/** A coloured tag for a status that comes from the API, for example IN_TRANSIT. */
@Component({
  selector: 'app-status-tag',
  imports: [TranslatePipe],
  template: `<span [class]="'trazza-tag tag-' + severity()">{{ (labelKey() || 'statuses.' + key()) | translate: labelParams() }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusTag {
  readonly status = input<string | null | undefined>('');
  readonly labelKey = input<string>('');
  readonly labelParams = input<Record<string, string | number>>({});
  readonly tone = input<Severity | null>(null);
  protected readonly key = computed(() => statusKey(this.status()));
  protected readonly severity = computed(() => this.tone() ?? statusSeverity(this.status()));
}
