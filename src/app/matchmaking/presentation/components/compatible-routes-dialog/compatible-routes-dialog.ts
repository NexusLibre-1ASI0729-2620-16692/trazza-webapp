import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {ReturnRoute} from '../../../domain/model/return-route.entity';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {TrazzaNumberPipe} from '../../../../shared/presentation/pipes/trazza-number.pipe';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';

/** Read only list of the return routes that could carry one of the merchant's shipments. */
@Component({
  selector: 'app-compatible-routes-dialog',
  imports: [MatDialogModule, MatButton, TranslatePipe, TrazzaNumberPipe, TrazzaDateTimePipe],
  template: `
    <h2 mat-dialog-title>{{ 'shipment.compatible-routes' | translate }}</h2>
    <mat-dialog-content>
      <p class="text-sm trazza-muted mt-0">{{ 'shipment.compatible-routes-hint' | translate }}</p>
      @for (route of routes; track route.id) {
        <div class="divider-row">
          <div class="trazza-route">{{ route.label }}</div>
          <div class="text-sm trazza-muted">
            {{ route.departureAt | trazzaDateTime: locale.language() }} · {{ route.vehicle.plate }} ·
            {{ route.availableWeightKg | trazzaNumber }} kg {{ 'return-route.free' | translate }}
          </div>
        </div>
      } @empty {
        <p class="trazza-muted">{{ 'shipment.no-compatible-routes' | translate }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>{{ 'actions.close' | translate }}</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompatibleRoutesDialog {
  protected readonly routes = inject<ReturnRoute[]>(MAT_DIALOG_DATA);
  protected readonly locale = inject(LocaleService);
}
