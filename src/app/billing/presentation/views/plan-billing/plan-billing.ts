import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BillingStore} from '../../../application/billing.store';
import {CheckoutDialog} from '../../components/checkout-dialog/checkout-dialog';
import {ReceiptDialog} from '../../components/receipt-dialog/receipt-dialog';
import {Receipt} from '../../../domain/model/receipt.entity';

@Component({
  selector: 'app-plan-billing',
  standalone: true,
  imports: [CommonModule, CheckoutDialog, ReceiptDialog],
  templateUrl: './plan-billing.html',
  styleUrls: ['./plan-billing.css']
})
export class PlanBilling {
  protected readonly billingStore = inject(BillingStore);

  protected readonly showCheckout = signal(false);
  protected readonly showReceipt = signal(false);
  protected readonly selectedReceipt = signal<Receipt | null>(null);

  constructor() {
    this.billingStore.loadBilling();
  }

  protected openCheckout(): void {
    this.showCheckout.set(true);
  }

  protected closeCheckout(): void {
    this.showCheckout.set(false);
  }

  protected onUpgradeSuccess(): void {
    // Se refresca automáticamente porque el store actualiza su signal
  }

  protected viewReceipt(transactionId: number): void {
    const receipt = this.billingStore.receiptForTransaction(transactionId);
    if (receipt) {
      this.selectedReceipt.set(receipt);
      this.showReceipt.set(true);
    }
  }

  protected closeReceipt(): void {
    this.showReceipt.set(false);
    this.selectedReceipt.set(null);
  }
}
