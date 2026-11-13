import { environment } from '../../../environments/environment';
export class PaymentTransactionsApiEndpoint {
  static readonly GET_ALL = `${environment.platformProviderApiBaseUrl}${environment.platformProviderPaymentTransactionsEndpointPath}`;
  static readonly CREATE = this.GET_ALL;
}
