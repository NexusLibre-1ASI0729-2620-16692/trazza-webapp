import { environment } from '../../../environments/environment';
export class ReceiptsApiEndpoint {
  static readonly GET_ALL = `${environment.platformProviderApiBaseUrl}${environment.platformProviderReceiptsEndpointPath}`;
  static readonly CREATE = this.GET_ALL;
}
