import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {FleetStore} from '../../../application/fleet.store';
import {Driver} from '../../../domain/model/driver.entity';
import {DriverDialog} from '../../components/driver-dialog/driver-dialog';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';
import {StarRating} from '../../../../shared/presentation/components/star-rating/star-rating';

@Component({
  selector: 'app-driver-list',
  imports: [MatTableModule, MatButton, MatIconButton, MatIcon, TranslatePipe, StatusTag, EmptyState, StarRating],
  templateUrl: './driver-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverList implements OnInit {
  protected readonly store = inject(FleetStore);
  private readonly dialog = inject(MatDialog);
  private readonly feedback = inject(FeedbackService);

  protected readonly columns = ['name', 'sex', 'experience', 'status', 'actions'];

  ngOnInit(): void {
    this.store.loadFleet().catch(error => this.feedback.showError(error));
  }

  protected open(driver: Driver | null = null): void {
    this.dialog.open(DriverDialog, { data: new Driver(driver ?? {}), width: '28rem', maxWidth: '95vw' });
  }

  protected deactivate(driver: Driver): void {
    this.feedback.attempt(() => this.store.deactivateDriver(driver), 'driver.deactivated').then();
  }
}
