import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Money} from '../../../shared/domain/model/money.value-object';
import {ReceiptType} from './receipt-type.value-object';
import {PaymentTransaction} from './payment-transaction.entity';

export interface ReceiptProps {
  id?: number;
  transactionId: number;
  userId: number;
  type: ReceiptType;
  number: number;
  customerName: string;
  customerDocument: string;
  total: Money;
  issuedAt: string;
}

export class Receipt implements BaseEntity {
  static readonly IGV_RATE = 0.18;

  readonly #id: number;
  readonly #transactionId: number;
  readonly #userId: number;
  readonly #type: ReceiptType;
  readonly #number: number;
  readonly #customerName: string;
  readonly #customerDocument: string;
  readonly #total: Money;
  readonly #issuedAt: string;

  constructor(props: ReceiptProps) {
    if (!props.transactionId) throw new Error('validation.transaction-required');
    if (!props.userId) throw new Error('validation.user-required');
    if (!(props.type instanceof ReceiptType)) throw new Error('validation.receipt-type-invalid');
    if (!Number.isInteger(Number(props.number)) || Number(props.number) <= 0) throw new Error('validation.receipt-number-invalid');
    if ((props.customerName ?? '').trim().length < 3) throw new Error('validation.customer-name-required');
    if (!props.type.acceptsDocument(props.customerDocument)) throw new Error(props.type.documentError);
    if (!(props.total instanceof Money) || props.total.amount <= 0) throw new Error('validation.money-invalid');
    this.#id = props.id ?? 0;
    this.#transactionId = props.transactionId;
    this.#userId = props.userId;
    this.#type = props.type;
    this.#number = Number(props.number);
    this.#customerName = props.customerName.trim();
    this.#customerDocument = props.customerDocument;
    this.#total = props.total;
    this.#issuedAt = props.issuedAt;
  }

  static issue(props: { transaction: PaymentTransaction; type: ReceiptType; number: number; customerName: string; customerDocument: string }): Receipt {
    if (!props.transaction.status.isPaid) throw new Error('validation.transaction-not-paid');
    return new Receipt({
      transactionId: props.transaction.id,
      userId: props.transaction.userId,
      type: props.type,
      number: props.number,
      customerName: props.customerName,
      customerDocument: props.customerDocument,
      total: props.transaction.amount,
      issuedAt: new Date().toISOString()
    });
  }

  get id(): number {
    return this.#id;
  }

  get transactionId(): number {
    return this.#transactionId;
  }

  get userId(): number {
    return this.#userId;
  }

  get type(): ReceiptType {
    return this.#type;
  }

  get number(): number {
    return this.#number;
  }

  get customerName(): string {
    return this.#customerName;
  }

  get customerDocument(): string {
    return this.#customerDocument;
  }

  get total(): Money {
    return this.#total;
  }

  get issuedAt(): string {
    return this.#issuedAt;
  }

  get code(): string {
    return `${this.#type.series}-${String(this.#number).padStart(8, '0')}`;
  }

  get subtotal(): Money {
    return new Money({ amount: this.#total.amount / (1 + Receipt.IGV_RATE), currency: this.#total.currency });
  }

  get igv(): Money {
    return new Money({ amount: this.#total.amount - this.subtotal.amount, currency: this.#total.currency });
  }
}
