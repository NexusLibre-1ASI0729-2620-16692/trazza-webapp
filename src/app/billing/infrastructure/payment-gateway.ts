import {Injectable} from '@angular/core';
import {Observable, of, delay} from 'rxjs';
import {Money} from '../../shared/domain/model/money.value-object';
import {PaymentMethod} from '../domain/model/payment-method.value-object';

export interface ChargeAnswer {
  approved: boolean;
  authorizationCode: string | null;
}

@Injectable({providedIn: 'root'})
export class PaymentGateway {
  /**
   * Simula el cargo a la tarjeta. En un entorno real, esto llamaría a
   * Stripe / MercadoPago / Niubiz, etc.
   */
  charge(amount: Money, method: PaymentMethod): Observable<ChargeAnswer> {
    const approved = amount.amount > 0;
    const authorizationCode = approved
      ? `AUTH-${Date.now()}-${Math.floor(Math.random() * 10000)}`
      : null;

    return of({approved, authorizationCode}).pipe(delay(800));
  }
}
