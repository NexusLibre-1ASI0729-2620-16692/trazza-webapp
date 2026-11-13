import {PaymentTransaction} from '../domain/model/payment-transaction.entity';
import {SubscriptionPlan} from '../domain/model/subscription-plan.value-object';
import {PaymentMethod} from '../domain/model/payment-method.value-object';
import {PaymentStatus} from '../domain/model/payment-status.value-object';
import {Money} from '../../shared/domain/model/money.value-object';
import {PaymentTransactionResponse} from './payment-transactions-response';

export class PaymentTransactionAssembler {
  static toEntity(response: PaymentTransactionResponse): PaymentTransaction {
    return new PaymentTransaction({
      id: response.id,
      userId: response.userId,
      plan: new SubscriptionPlan(response.planCode),
      amount: new Money({ amount: response.amount, currency: response.currency }),
      method: new PaymentMethod({
        brand: response.method.brand,
        last4: response.method.last4,
        holderName: response.method.holderName,
        expiry: response.method.expiry
      }),
      status: new PaymentStatus(response.status),
      authorizationCode: response.authorizationCode,
      createdAt: response.createdAt,
      paidAt: response.paidAt,
      periodStart: response.periodStart,
      periodEnd: response.periodEnd
    });
  }

  static toResponse(entity: PaymentTransaction): PaymentTransactionResponse {
    return {
      id: entity.id,
      userId: entity.userId,
      planCode: entity.plan.code,
      amount: entity.amount.amount,
      currency: entity.amount.currency,
      method: {
        brand: entity.method.brand,
        last4: entity.method.last4,
        holderName: entity.method.holderName,
        expiry: entity.method.expiry
      },
      status: entity.status.value,
      authorizationCode: entity.authorizationCode,
      createdAt: entity.createdAt,
      paidAt: entity.paidAt,
      periodStart: entity.periodStart,
      periodEnd: entity.periodEnd
    };
  }
}
