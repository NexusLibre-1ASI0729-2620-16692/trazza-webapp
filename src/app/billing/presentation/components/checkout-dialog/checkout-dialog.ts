import {Component, EventEmitter, inject, Input, Output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BillingStore, UpgradeData} from '../../../application/billing.store';

@Component({
  selector: 'app-checkout-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-dialog.html',
  styleUrls: ['./checkout-dialog.css']
})
export class CheckoutDialog {
  private readonly billingStore = inject(BillingStore);

  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  protected readonly processing = this.billingStore.processing;
  protected readonly error = this.billingStore.error;

  protected form: UpgradeData = {
    cardNumber: '',
    holderName: '',
    expiry: '',
    receiptType: 'boleta',
    customerName: '',
    customerDocument: ''
  };

  protected confirm(): void {
    this.billingStore.upgradeToPro(this.form).subscribe({
      next: () => {
        this.success.emit();
        this.close();
      },
      error: (err: Error) => {
        // El store ya maneja el error, pero por si acaso
        console.error(err.message);
      }
    });
  }

  protected close(): void {
    this.closed.emit();
  }
}
