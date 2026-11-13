import {inject, Injectable, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {BillingApi} from '../infrastructure/billing-api';
import {Plan} from '../domain/model/plan.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {FreightSettlement} from '../domain/model/freight-settlement.entity';
import {CancellationCompensation, CompensationAction} from '../domain/model/cancellation-compensation.entity';
import {upsertById} from '../../shared/application/collections';

/** Plans and subscriptions of the carrier (simulated payments), freight settlements and cancellation compensations. */
@Injectable({providedIn: 'root'})
export class BillingStore {
  private readonly api = inject(BillingApi);

  private readonly plansSignal = signal<Plan[]>([]);
  private readonly subscriptionsSignal = signal<Subscription[]>([]);
  private readonly settlementsSignal = signal<FreightSettlement[]>([]);
  private readonly compensationsSignal = signal<CancellationCompensation[]>([]);

  readonly plans = this.plansSignal.asReadonly();
  readonly subscriptions = this.subscriptionsSignal.asReadonly();
  readonly settlements = this.settlementsSignal.asReadonly();
  readonly compensations = this.compensationsSignal.asReadonly();

  async loadPlans(): Promise<void> {
    this.plansSignal.set(await firstValueFrom(this.api.listPlans()));
  }

  async loadSubscriptions(): Promise<void> {
    this.subscriptionsSignal.set(await firstValueFrom(this.api.listSubscriptions()));
  }

  async subscribe(plan: Plan, vehicleIds: string[]): Promise<Subscription> {
    if (!plan.acceptsVehicleCount(vehicleIds.length)) throw new Error('validation.plan-vehicle-count');
    const subscription = await firstValueFrom(this.api.subscribe(plan.code, vehicleIds));
    this.subscriptionsSignal.update(subscriptions => [subscription, ...subscriptions]);
    return subscription;
  }

  async renew(subscription: Subscription): Promise<void> {
    const updated = await firstValueFrom(this.api.renew(subscription.id));
    this.subscriptionsSignal.update(subscriptions => upsertById(subscriptions, updated));
  }

  async cancelSubscription(subscription: Subscription): Promise<void> {
    const updated = await firstValueFrom(this.api.cancelSubscription(subscription.id));
    this.subscriptionsSignal.update(subscriptions => upsertById(subscriptions, updated));
  }

  async loadSettlements(): Promise<void> {
    const [settlements, compensations] = await Promise.all([
      firstValueFrom(this.api.listSettlements()), firstValueFrom(this.api.listCompensations())
    ]);
    this.settlementsSignal.set(settlements);
    this.compensationsSignal.set(compensations);
  }

  async markPaid(settlement: FreightSettlement, externalReference: string | null): Promise<void> {
    const updated = await firstValueFrom(this.api.markPaid(settlement.trip.id, (externalReference ?? '').trim() || null));
    this.settlementsSignal.update(settlements => upsertById(settlements, updated));
  }

  async confirmSettlement(settlement: FreightSettlement): Promise<void> {
    const updated = await firstValueFrom(this.api.confirmSettlement(settlement.trip.id));
    this.settlementsSignal.update(settlements => upsertById(settlements, updated));
  }

  async updateCompensation(compensation: CancellationCompensation, action: CompensationAction): Promise<void> {
    const updated = await firstValueFrom(this.api.updateCompensation(compensation.trip.id, action));
    this.compensationsSignal.update(compensations => upsertById(compensations, updated));
  }
}
