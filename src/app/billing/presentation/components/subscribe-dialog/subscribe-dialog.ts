import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BillingStore} from '../../../application/billing.store';
import {Plan} from '../../../domain/model/plan.entity';
import {FleetStore} from '../../../../iam/application/fleet.store';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {TrazzaMoneyPipe} from '../../../../shared/presentation/pipes/trazza-money.pipe';

export const planRangeText = (plan: Plan, locale: LocaleService): string => plan.maxVehicles === null
  ? locale.instant('plan.min-trucks', { min: plan.minVehicles })
  : locale.instant('plan.range-trucks', { min: plan.minVehicles, max: plan.maxVehicles });

/** Pick the trucks for a plan and pay the first month (simulated gateway). Closes with true when subscribed. */
@Component({
  selector: 'app-subscribe-dialog',
  imports: [MatDialogModule, MatCheckbox, MatButton, MatIcon, TranslatePipe, TrazzaMoneyPipe],
  templateUrl: './subscribe-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscribeDialog {
  protected readonly plan = inject<Plan>(MAT_DIALOG_DATA);
  protected readonly fleet = inject(FleetStore);
  private readonly locale = inject(LocaleService);
  private readonly store = inject(BillingStore);
  private readonly feedback = inject(FeedbackService);
  private readonly dialogRef = inject(MatDialogRef<SubscribeDialog, boolean>);

  protected readonly vehicleIds = signal<string[]>([]);
  protected readonly sending = signal(false);
  protected readonly total = computed(() => this.plan.priceFor(this.vehicleIds().length));
  protected readonly validCount = computed(() => this.plan.acceptsVehicleCount(this.vehicleIds().length));
  protected readonly rangeText = computed(() => {
    this.locale.language();
    return planRangeText(this.plan, this.locale);
  });

  protected toggle(id: string, checked: boolean): void {
    this.vehicleIds.update(ids => checked ? [...ids, id] : ids.filter(item => item !== id));
  }

  protected async subscribe(): Promise<void> {
    this.sending.set(true);
    const subscribed = await this.feedback.attempt(() => this.store.subscribe(this.plan, this.vehicleIds()), 'plan.subscribed');
    this.sending.set(false);
    if (subscribed) this.dialogRef.close(true);
  }
}
