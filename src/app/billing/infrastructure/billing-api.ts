import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PlatformApi} from '../../shared/infrastructure/platform-api';
import {BillingAssembler} from './billing.assembler';
import {CancellationCompensationResource, FreightSettlementResource, PlanResource, SubscriptionResource} from './billing-resources';
import {Plan} from '../domain/model/plan.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {FreightSettlement} from '../domain/model/freight-settlement.entity';
import {CancellationCompensation, CompensationAction} from '../domain/model/cancellation-compensation.entity';

@Injectable({providedIn: 'root'})
export class BillingApi extends PlatformApi {
  static readonly PLANS_PATH = '/plans';
  static readonly SUBSCRIPTIONS_PATH = '/subscriptions';
  static readonly SETTLEMENTS_PATH = '/freight-settlements';
  static readonly COMPENSATIONS_PATH = '/cancellation-compensations';

  listPlans(): Observable<Plan[]> {
    return this.get<PlanResource[]>(BillingApi.PLANS_PATH).pipe(map(items => items.map(BillingAssembler.toPlan)));
  }

  listSubscriptions(): Observable<Subscription[]> {
    return this.get<SubscriptionResource[]>(BillingApi.SUBSCRIPTIONS_PATH).pipe(map(items => items.map(BillingAssembler.toSubscription)));
  }

  subscribe(planCode: string, vehicleIds: string[]): Observable<Subscription> {
    return this.post<SubscriptionResource>(BillingApi.SUBSCRIPTIONS_PATH, { planCode, vehicleIds }).pipe(map(BillingAssembler.toSubscription));
  }

  renew(id: number): Observable<Subscription> {
    return this.post<SubscriptionResource>(`${BillingApi.SUBSCRIPTIONS_PATH}/${id}/renew`).pipe(map(BillingAssembler.toSubscription));
  }

  cancelSubscription(id: number): Observable<Subscription> {
    return this.post<SubscriptionResource>(`${BillingApi.SUBSCRIPTIONS_PATH}/${id}/cancel`).pipe(map(BillingAssembler.toSubscription));
  }

  listSettlements(): Observable<FreightSettlement[]> {
    return this.get<FreightSettlementResource[]>(BillingApi.SETTLEMENTS_PATH).pipe(map(items => items.map(BillingAssembler.toFreightSettlement)));
  }

  markPaid(tripId: string, externalReference: string | null): Observable<FreightSettlement> {
    return this.post<FreightSettlementResource>(`${BillingApi.SETTLEMENTS_PATH}/${tripId}/mark-paid`, { externalReference })
      .pipe(map(BillingAssembler.toFreightSettlement));
  }

  confirmSettlement(tripId: string): Observable<FreightSettlement> {
    return this.post<FreightSettlementResource>(`${BillingApi.SETTLEMENTS_PATH}/${tripId}/confirm`).pipe(map(BillingAssembler.toFreightSettlement));
  }

  listCompensations(): Observable<CancellationCompensation[]> {
    return this.get<CancellationCompensationResource[]>(BillingApi.COMPENSATIONS_PATH).pipe(map(items => items.map(BillingAssembler.toCompensation)));
  }

  updateCompensation(tripId: string, action: CompensationAction): Observable<CancellationCompensation> {
    return this.post<CancellationCompensationResource>(`${BillingApi.COMPENSATIONS_PATH}/${tripId}/${action}`).pipe(map(BillingAssembler.toCompensation));
  }
}
