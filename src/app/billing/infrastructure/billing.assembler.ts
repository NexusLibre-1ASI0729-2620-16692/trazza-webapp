import {Plan} from '../domain/model/plan.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {FreightSettlement} from '../domain/model/freight-settlement.entity';
import {CancellationCompensation} from '../domain/model/cancellation-compensation.entity';
import {CancellationCompensationResource, FreightSettlementResource, PlanResource, SubscriptionResource} from './billing-resources';

export class BillingAssembler {
  static toPlan(resource: PlanResource): Plan {
    return new Plan({ ...resource });
  }

  static toSubscription(resource: SubscriptionResource): Subscription {
    return new Subscription({ ...resource, plan: BillingAssembler.toPlan(resource.plan) });
  }

  static toFreightSettlement(resource: FreightSettlementResource): FreightSettlement {
    return new FreightSettlement({ ...resource });
  }

  static toCompensation(resource: CancellationCompensationResource): CancellationCompensation {
    return new CancellationCompensation({ ...resource });
  }
}
