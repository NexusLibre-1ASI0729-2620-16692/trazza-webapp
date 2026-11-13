export interface ReceiptResponse {
  id: number;
  transactionId: number;
  userId: number;
  type: string;
  number: number;
  customerName: string;
  customerDocument: string;
  total: number;
  currency: string;
  issuedAt: string;
}
