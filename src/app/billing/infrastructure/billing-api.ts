import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PaymentTransaction} from '../domain/model/payment-transaction.entity';
import {Receipt} from '../domain/model/receipt.entity';
import {PaymentTransactionAssembler} from './payment-transaction-assembler';
import {ReceiptAssembler} from './receipt-assembler';
import {PaymentTransactionResponse} from './payment-transactions-response';
import {ReceiptResponse} from './receipts-response';
import {PaymentTransactionsApiEndpoint} from './payment-transactions-api-endpoint';
import {ReceiptsApiEndpoint} from './receipts-api-endpoint';

@Injectable({providedIn: 'root'})
export class BillingApi {
  private readonly http = inject(HttpClient);

  getPaymentTransactions(): Observable<PaymentTransaction[]> {
    return this.http
      .get<PaymentTransactionResponse[]>(PaymentTransactionsApiEndpoint.GET_ALL)
      .pipe(map(responses => responses.map(PaymentTransactionAssembler.toEntity)));
  }

  createPaymentTransaction(transaction: PaymentTransaction): Observable<PaymentTransaction> {
    const body = PaymentTransactionAssembler.toResponse(transaction);
    return this.http
      .post<PaymentTransactionResponse>(PaymentTransactionsApiEndpoint.CREATE, body)
      .pipe(map(PaymentTransactionAssembler.toEntity));
  }

  getReceipts(): Observable<Receipt[]> {
    return this.http
      .get<ReceiptResponse[]>(ReceiptsApiEndpoint.GET_ALL)
      .pipe(map(responses => responses.map(ReceiptAssembler.toEntity)));
  }

  createReceipt(receipt: Receipt): Observable<Receipt> {
    const body = ReceiptAssembler.toResponse(receipt);
    return this.http
      .post<ReceiptResponse>(ReceiptsApiEndpoint.CREATE, body)
      .pipe(map(ReceiptAssembler.toEntity));
  }
}
