import {computed, Injectable, signal} from '@angular/core';
import {Observable, tap} from 'rxjs';

import {
  OpenShipmentData,
  Shipment
} from '../domain/model/shipment.entity';

import {
  Incident,
  IncidentParams
} from '../domain/model/incident.entity';

import {IncidentType} from '../domain/model/incident-type.value-object';

import {GeoLocation} from '../../shared/domain/model/geo-location.value-object';

import {ExecutionApi} from '../infrastructure/execution-api';
import {NotificationStore} from '../../shared/application/notification.store';
import {IamStore} from '../../iam/application/iam.store';

@Injectable({
  providedIn: 'root'
})
export class ExecutionStore {

  private readonly shipmentsSignal = signal<Shipment[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly loadedSignal = signal(false);

  readonly shipments = this.shipmentsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  readonly myShipments = computed(() => {
    const userId = this.iamStore.currentUserId();

    if (userId === null) {
      return [];
    }

    if (this.iamStore.isCarrier()) {
      return this.shipments().filter(
        shipment => shipment.carrierId === userId
      );
    }

    if (this.iamStore.isMerchant()) {
      return this.shipments().filter(
        shipment => shipment.merchantId === userId
      );
    }

    return [];
  });

  readonly myActiveShipments = computed(() =>
    this.myShipments().filter(shipment => shipment.status.isActive)
  );

  readonly myFinishedShipments = computed(() =>
    this.myShipments().filter(shipment =>
      shipment.status.isDelivered ||
      shipment.status.isCancelled
    )
  );

  /**
   * Shipments actualmente activos.
   */
  readonly activeShipments = computed(() =>
    this.shipments().filter(shipment => shipment.status.isActive)
  );

  /**
   * Shipments que ya terminaron su ciclo.
   */
  readonly finishedShipments = computed(() =>
    this.shipments().filter(shipment =>
      shipment.status.isDelivered ||
      shipment.status.value === 'cancelled'
    )
  );

  constructor(
    private readonly executionApi: ExecutionApi,
    private readonly notificationStore: NotificationStore,
    private readonly iamStore: IamStore
  ) {}

  /**
   * Carga todos los shipments desde la API.
   */
  loadShipments(): void {
    if (this.loaded() || this.loading()) {
      return;
    }

    this.fetchShipments().subscribe();
  }

  /**
   * Fuerza la carga de shipments.
   */
  fetchShipments(): Observable<Shipment[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.executionApi.getShipments().pipe(
      tap({
        next: shipments => {
          this.shipmentsSignal.set(shipments);
          this.loadedSignal.set(true);
          this.loadingSignal.set(false);
        },
        error: error => {
          console.error('ExecutionStore: error loading shipments', error);

          this.errorSignal.set(
            'No se pudieron cargar los envíos.'
          );

          this.loadedSignal.set(false);
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Busca un shipment por ID.
   */
  getShipmentById(id: number): Shipment | undefined {
    return this.shipments().find(shipment => shipment.id === id);
  }

  /**
   * Obtiene un shipment directamente desde la API.
   */
  fetchShipmentById(id: number): Observable<Shipment> {
    return this.executionApi.getShipmentById(id).pipe(
      tap(shipment => {
        this.upsertShipment(shipment);
      })
    );
  }

  /**
   * Abre un nuevo shipment después de una confirmación de match.
   */
  openShipment(data: OpenShipmentData): Observable<Shipment> {
    const shipment = Shipment.open(data);

    return this.executionApi.createShipment(shipment).pipe(
      tap(createdShipment => {
        this.upsertShipment(createdShipment);

        this.notificationStore.notify({
          severity: 'success',
          summaryKey: 'shipment.notification.created.summary',
          detailKey: 'shipment.notification.created.detail',
          params: {
            shipment: createdShipment.code
          }
        });
      })
    );
  }

  /**
   * Confirma que el carrier recogió la carga.
   */
  async confirmPickup(shipment: Shipment): Promise<void> {
    if (!shipment.status.isActive) {
      // this.notificationStore.showError('El envío no se encuentra activo.');
      return;
    }

    shipment.confirmPickup();
    await this.persistShipment(shipment, '', '');
  }

  /**
   * Actualiza la ubicación actual del shipment.
   */
  shareLocation(
    shipment: Shipment,
    location?: GeoLocation
  ): Observable<Shipment> {

    if (!shipment.status.isActive) {
      // this.notificationStore.showError('El envío no se encuentra activo.');
      throw new Error('execution.shipment-not-active');
    }

    const newLocation = location ?? shipment.currentLocation;

    if (!newLocation) {
      throw new Error('execution.location-required');
    }

    shipment.updateLocation(newLocation);

    const updatedShipment = this.persistShipment(
      shipment,
      'shipment.notification.location.summary',
      'shipment.notification.location.detail',
      false
    );

    if (shipment.isOffRoute) {
      this.notificationStore.notify({
        severity: 'warn',
        summaryKey: 'shipment.notification.deviation.summary',
        detailKey: 'shipment.notification.deviation.detail',
        params: {
          shipment: shipment.code,
          distance: Math.round(shipment.deviationKm * 100) / 100
        }
      });
    }

    return updatedShipment;
  }

  /**
   * Confirma la entrega.
   */
  async confirmDelivery(
    shipment: Shipment,
    acknowledgeDistance = false
  ): Promise<void> {
    if (!shipment.status.isActive) {
      // this.notificationStore.showError('El envío no se encuentra activo.');
      return;
    }

    shipment.confirmDelivery(acknowledgeDistance);
    await this.persistShipment(shipment, '', '');
  }

  /**
   * Confirma que el merchant recibió la carga.
   */
  confirmReception(shipment: Shipment): Observable<Shipment> {
    if (!shipment.status.isActive) {
      // this.notificationStore.showError('El envío no se encuentra activo.');
      throw new Error('execution.shipment-not-active');
    }

    shipment.confirmReception();

    return this.persistShipment(
      shipment,
      'shipment.notification.reception.summary',
      'shipment.notification.reception.detail'
    );
  }

  /**
   * Cancela un shipment.
   */
  cancelShipment(shipment: Shipment): Observable<Shipment> {
    shipment.cancel();

    return this.persistShipment(
      shipment,
      'shipment.notification.cancelled.summary',
      'shipment.notification.cancelled.detail'
    );
  }

  /**
   * Reporta una incidencia asociada al shipment.
   */
  reportIncident(
    shipment: Shipment,
    data: {
      type: string;
      description: string;
      reporterId: number;
      reporterRole: 'carrier' | 'merchant';
    }
  ): Observable<Shipment> {

    const incidentParams: IncidentParams = {
      type: new IncidentType(data.type),
      description: data.description,
      reporterId: data.reporterId,
      reporterRole: data.reporterRole
    };

    const incident = new Incident(incidentParams);

    shipment.reportIncident(incident);

    return this.persistShipment(
      shipment,
      'incident.notification.created.summary',
      'incident.notification.created.detail'
    );
  }

  /**
   * Persiste un shipment y actualiza el store.
   */
  private persistShipment(
    shipment: Shipment,
    summaryKey: string,
    detailKey: string,
    notify = true
  ): Observable<Shipment> {

    return this.executionApi.updateShipment(shipment).pipe(
      tap(updatedShipment => {

        this.upsertShipment(updatedShipment);

        if (notify) {
          this.notificationStore.notify({
            severity: 'success',
            summaryKey,
            detailKey,
            params: {
              shipment: updatedShipment.code
            }
          });
        }
      })
    );
  }

  /**
   * Inserta o reemplaza un shipment dentro del store.
   */
  private upsertShipment(shipment: Shipment): void {
    this.shipmentsSignal.update(shipments => {
      const exists = shipments.some(
        current => current.id === shipment.id
      );

      if (!exists) {
        return [...shipments, shipment];
      }

      return shipments.map(current =>
        current.id === shipment.id ? shipment : current
      );
    });
  }
}
