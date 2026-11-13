import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Shipment} from '../domain/model/shipment.entity';
import {
  ShipmentResource,
  ShipmentsResponse
} from './shipments-response';
import {ShipmentAssembler} from './shipment-assembler';

export class ShipmentsApiEndpoint extends BaseApiEndpoint<
  Shipment,
  ShipmentResource,
  ShipmentsResponse,
  typeof ShipmentAssembler
> {

  constructor(http: HttpClient) {

    super(
      http,
      `${environment.platformProviderApiBaseUrl}${environment.platformProviderShipmentsEndpointPath}`,
      ShipmentAssembler
    );
  }
}
