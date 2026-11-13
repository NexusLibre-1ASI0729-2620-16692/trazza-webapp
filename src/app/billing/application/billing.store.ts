import {computed, inject, Injectable, signal} from '@angular/core';
import {defer, forkJoin, Observable, of, throwError} from 'rxjs';
import {finalize, map, switchMap, tap} from 'rxjs/operators';
import {BillingApi} from '../infrastructure/billing-api';
import {PaymentGateway} from '../infrastructure/payment-gateway';
import {PaymentTransaction} from '../domain/model/payment-transaction.entity';
import {Receipt} from '../domain/model/receipt.entity';
import {SubscriptionPlan} from '../domain/model/subscription-plan.value-object';
import {PaymentMethod} from '../domain/model/payment-method.value-object';
import {ReceiptType} from '../domain/model/receipt-type.value-object';
import {IamStore} from '../../iam/application/iam.store';
import {byNewest} from '../../shared/application/collections';
import {todayIso} from '../../shared/domain/model/calendar';

export interface UpgradeData {
  cardNumber: string;
  holderName: string;
  expiry: string;
  receiptType: string;
  customerName: string;
  customerDocument: string;
}

export interface UpgradeResult {
  transaction: PaymentTransaction;
  receipt: Receipt;
}

@Injectable({providedIn: 'root'})
export class BillingStore {
  private readonly billingApi = inject(BillingApi);
  private readonly paymentGateway = inject(PaymentGateway);
  private readonly iamStore = inject(IamStore);

  private readonly transactionsSignal = signal<PaymentTransaction[]>([]);
  private readonly receiptsSignal = signal<Receipt[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly processingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly transactions = this.transactionsSignal.asReadonly();
  readonly receipts = this.receiptsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly processing = this.processingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly myTransactions = computed(() => this.transactions()
    .filter(transaction => transaction.userId === this.iamStore.currentUserId())
    .sort(byNewest(transaction => transaction.createdAt)));

  readonly myReceipts = computed(() => this.receipts()
    .filter(receipt => receipt.userId === this.iamStore.currentUserId())
    .sort(byNewest(receipt => receipt.issuedAt)));

  readonly activeSubscription = computed(() => {
    const today = todayIso();
    return this.myTransactions().find(transaction => transaction.covers(today)) ?? null;
  });

  readonly currentPlan = computed(() => this.activeSubscription()?.plan ?? new SubscriptionPlan(SubscriptionPlan.FREE));

  readonly lastPaymentMethod = computed(() => this.myTransactions()[0]?.method ?? null);

  loadBilling(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    forkJoin([this.billingApi.getPaymentTransactions(), this.billingApi.getReceipts()]).subscribe({
      next: ([transactions, receipts]) => {
        this.transactionsSignal.set(transactions);
        this.receiptsSignal.set(receipts);
        this.loadingSignal.set(false);
      },
      error: (error: Error) => {
        this.errorSignal.set(error.message);
        this.loadingSignal.set(false);
      }
    });
  }

  canPublish(usedThisMonth: number): boolean {
    return this.currentPlan().allowsPublication(usedThisMonth);
  }

  receiptForTransaction(transactionId: number): Receipt | undefined {
    return this.receipts().find(receipt => receipt.transactionId === transactionId);
  }

  upgradeToPro(data: UpgradeData): Observable<UpgradeResult> {
    return defer(() => {
      if (!this.currentPlan().isFree) throw new Error('validation.plan-already-active');
      const receiptType = new ReceiptType(data.receiptType);
      if (!receiptType.acceptsDocument(data.customerDocument)) throw new Error(receiptType.documentError);
      if ((data.customerName ?? '').trim().length < 3) throw new Error('validation.customer-name-required');
      const method = PaymentMethod.fromCard({ number: data.cardNumber, holderName: data.holderName, expiry: data.expiry });
      const transaction = PaymentTransaction.create({
        userId: this.iamStore.currentUserId() ?? 0,
        plan: new SubscriptionPlan(SubscriptionPlan.PRO),
        method
      });
      this.processingSignal.set(true);
      return this.paymentGateway.charge(transaction.amount, transaction.method).pipe(
        switchMap(answer => {
          if (answer.approved && answer.authorizationCode) transaction.markPaid(answer.authorizationCode);
          else transaction.markFailed();
          return this.billingApi.createPaymentTransaction(transaction).pipe(map(saved => ({ saved, approved: answer.approved })));
        }),
        tap(({ saved }) => this.transactionsSignal.update(transactions => [...transactions, saved])),
        switchMap(({ saved, approved }) => approved
          ? this.issueReceipt(saved, receiptType, data)
          : throwError(() => new Error('validation.card-declined'))),
        finalize(() => this.processingSignal.set(false))
      );
    });
  }

  private issueReceipt(transaction: PaymentTransaction, type: ReceiptType, data: UpgradeData): Observable<UpgradeResult> {
    const nextNumber = this.receipts()
      .filter(receipt => receipt.type.value === type.value)
      .reduce((max, receipt) => Math.max(max, receipt.number), 0) + 1;
    const receipt = Receipt.issue({
      transaction,
      type,
      number: nextNumber,
      customerName: data.customerName,
      customerDocument: data.customerDocument
    });
    return this.billingApi.createReceipt(receipt).pipe(
      tap(saved => this.receiptsSignal.update(receipts => [...receipts, saved])),
      switchMap(saved => of({ transaction, receipt: saved }))
    );
  }
}
