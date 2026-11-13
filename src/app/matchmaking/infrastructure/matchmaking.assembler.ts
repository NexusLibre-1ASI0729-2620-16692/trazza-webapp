import {ReturnRoute} from '../domain/model/return-route.entity';
import {ShipmentRequest} from '../domain/model/shipment-request.entity';
import {MatchProposal} from '../domain/model/match-proposal.entity';
import {Message} from '../domain/model/message.entity';
import {MatchProposalResource, MessageResource, ReturnRouteResource, ShipmentRequestResource} from './matchmaking-resources';

export class MatchmakingAssembler {
  static toReturnRoute(resource: ReturnRouteResource): ReturnRoute {
    return new ReturnRoute({ ...resource });
  }

  static toShipmentRequest(resource: ShipmentRequestResource): ShipmentRequest {
    return new ShipmentRequest({ ...resource });
  }

  static toMatchProposal(resource: MatchProposalResource): MatchProposal {
    return new MatchProposal({
      ...resource,
      route: MatchmakingAssembler.toReturnRoute(resource.route),
      shipment: MatchmakingAssembler.toShipmentRequest(resource.shipment)
    });
  }

  static toMessage(resource: MessageResource): Message {
    return { ...resource };
  }
}
