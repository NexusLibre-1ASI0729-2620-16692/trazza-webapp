import {Receipt} from '../domain/model/receipt.entity';
import {ReceiptType} from '../domain/model/receipt-type.value-object';
import {Money} from '../../shared/domain/model/money.value-object';
import {ReceiptResponse} from './receipts-response';

export class ReceiptAssembler {
  static toEntity(response: ReceiptResponse): Receipt {
    return new Receipt({
      id: response.id,
      transactionId: response.transactionId,
      userId: response.userId,
      type: new ReceiptType(response.type),
      number: response.number,
      customerName: response.customerName,
      customerDocument: response.customerDocument,
      total: new Money({ amount: response.total, currency: response.currency }),
      issuedAt: response.issuedAt
    });
  }

  static toResponse(entity: Receipt): ReceiptResponse {
    return {
      id: entity.id,
      transactionId: entity.transactionId,
      userId: entity.userId,
      type: entity.type.value,
      number: entity.number,
      customerName: entity.customerName,
      customerDocument: entity.customerDocument,
      total: entity.total.amount,
      currency: entity.total.currency,
      issuedAt: entity.issuedAt
    };
  }
}
