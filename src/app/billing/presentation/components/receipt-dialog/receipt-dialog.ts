import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Receipt} from '../../../domain/model/receipt.entity';

@Component({
  selector: 'app-receipt-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt-dialog.html',
  styleUrls: ['./receipt-dialog.css']
})
export class ReceiptDialog {
  @Input() visible = false;
  @Input() receipt: Receipt | null = null;
  @Output() closed = new EventEmitter<void>();

  protected close(): void {
    this.closed.emit();
  }
}
