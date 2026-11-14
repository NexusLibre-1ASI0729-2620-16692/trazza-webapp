import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {FleetStore} from '../../../application/fleet.store';
import {SavedAddress} from '../../../domain/model/saved-address.entity';
import {SavedAddressDialog} from '../../components/saved-address-dialog/saved-address-dialog';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {EmptyState} from '../../../../shared/presentation/components/empty-state/empty-state';

@Component({
  selector: 'app-saved-address-list',
  imports: [MatTableModule, MatButton, MatIconButton, MatIcon, TranslatePipe, EmptyState],
  templateUrl: './saved-address-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavedAddressList implements OnInit {
  protected readonly store = inject(FleetStore);
  private readonly dialog = inject(MatDialog);
  private readonly feedback = inject(FeedbackService);

  protected readonly columns = ['label', 'address', 'district', 'coordinates', 'actions'];

  ngOnInit(): void {
    this.store.loadSavedAddresses().catch(error => this.feedback.showError(error));
  }

  protected open(): void {
    this.dialog.open(SavedAddressDialog, { width: '42rem', maxWidth: '95vw' });
  }

  protected remove(address: SavedAddress): void {
    this.feedback.attempt(() => this.store.deleteSavedAddress(address), 'saved-address.deleted').then();
  }
}
