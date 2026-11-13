export type ReceiptTypeValue = 'boleta' | 'factura';

export class ReceiptType {
  static readonly BOLETA: ReceiptTypeValue = 'boleta';
  static readonly FACTURA: ReceiptTypeValue = 'factura';
  static readonly RULES: Readonly<Record<ReceiptTypeValue, { series: string; documentPattern: RegExp }>> = Object.freeze({
    boleta: Object.freeze({ series: 'B001', documentPattern: /^\d{8}$/ }),
    factura: Object.freeze({ series: 'F001', documentPattern: /^(10|20)\d{9}$/ })
  });

  readonly #value: ReceiptTypeValue;

  constructor(value: string) {
    if (!Object.hasOwn(ReceiptType.RULES, value)) throw new Error('validation.receipt-type-invalid');
    this.#value = value as ReceiptTypeValue;
  }

  get value(): ReceiptTypeValue {
    return this.#value;
  }

  get series(): string {
    return ReceiptType.RULES[this.#value].series;
  }

  get documentError(): string {
    return this.#value === ReceiptType.FACTURA ? 'validation.ruc-invalid' : 'validation.dni-invalid';
  }

  acceptsDocument(documentNumber: string): boolean {
    return ReceiptType.RULES[this.#value].documentPattern.test(documentNumber ?? '');
  }
}
