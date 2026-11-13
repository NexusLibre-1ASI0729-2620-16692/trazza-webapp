import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {Shipment} from '../domain/model/shipment.entity';
import {ShipmentsApiEndpoint} from './shipments-api-endpoint';

@Injectable({
  providedIn: 'root'
})
export class ExecutionApi {

  private readonly shipmentsEndpoint: ShipmentsApiEndpoint;

  constructor(
    private readonly http: HttpClient
  ) {
    this.shipmentsEndpoint =
      new ShipmentsApiEndpoint(this.http);
  }

  getShipments(): Observable<Shipment[]> {
    return this.shipmentsEndpoint.getAll();
  }

  getShipmentById(
    id: number
  ): Observable<Shipment> {
    return this.shipmentsEndpoint.getById(id);
  }

  createShipment(
    shipment: Shipment
  ): Observable<Shipment> {
    return this.shipmentsEndpoint.create(
      shipment
    );
  }

  updateShipment(shipment: Shipment): Observable<Shipment> {
    return this.shipmentsEndpoint.update(shipment, shipment.id);
  }
}
