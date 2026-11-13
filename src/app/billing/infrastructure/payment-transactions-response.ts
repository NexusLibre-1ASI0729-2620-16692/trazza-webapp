export interface PaymentTransactionResponse {
  id: number;
  userId: number;
  planCode: string;
  amount: number;
  currency: string;
  method: {
    brand: string;
    last4: string;
    holderName: string;
    expiry: string;
  };
  status: string;
  authorizationCode: string | null;
  createdAt: string | null;
  paidAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
}
