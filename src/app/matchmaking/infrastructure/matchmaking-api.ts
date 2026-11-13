import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {MatchmakingAssembler} from './matchmaking.assembler';
import {MatchProposalResource, MessageResource, ReturnRouteResource, ShipmentRequestResource} from './matchmaking-resources';
import {ReturnRoute} from '../domain/model/return-route.entity';
import {ShipmentRequest} from '../domain/model/shipment-request.entity';
import {MatchProposal} from '../domain/model/match-proposal.entity';
import {Message} from '../domain/model/message.entity';
import {CreateReturnRouteCommand} from '../domain/commands/create-return-route.command';
import {CreateShipmentRequestCommand} from '../domain/commands/create-shipment-request.command';
import {CreateMatchProposalCommand} from '../domain/commands/create-match-proposal.command';

export type ProposalAction = 'accept' | 'reject' | 'cancel';

@Injectable({providedIn: 'root'})
export class MatchmakingApi extends BaseApi {
  static readonly RETURN_ROUTES_PATH = '/return-routes';
  static readonly SHIPMENT_REQUESTS_PATH = '/shipment-requests';
  static readonly MATCH_PROPOSALS_PATH = '/match-proposals';

  listMyRoutes(): Observable<ReturnRoute[]> {
    return this.get<ReturnRouteResource[]>(MatchmakingApi.RETURN_ROUTES_PATH).pipe(map(items => items.map(MatchmakingAssembler.toReturnRoute)));
  }

  getRoute(id: string): Observable<ReturnRoute> {
    return this.get<ReturnRouteResource>(`${MatchmakingApi.RETURN_ROUTES_PATH}/${id}`).pipe(map(MatchmakingAssembler.toReturnRoute));
  }

  createRoute(command: CreateReturnRouteCommand): Observable<ReturnRoute> {
    return this.post<ReturnRouteResource>(MatchmakingApi.RETURN_ROUTES_PATH, { ...command }).pipe(map(MatchmakingAssembler.toReturnRoute));
  }

  cancelRoute(id: string): Observable<ReturnRoute> {
    return this.post<ReturnRouteResource>(`${MatchmakingApi.RETURN_ROUTES_PATH}/${id}/cancel`).pipe(map(MatchmakingAssembler.toReturnRoute));
  }

  suggestShipments(routeId: string): Observable<ShipmentRequest[]> {
    return this.get<ShipmentRequestResource[]>(`${MatchmakingApi.RETURN_ROUTES_PATH}/${routeId}/suggested-shipments`)
      .pipe(map(items => items.map(MatchmakingAssembler.toShipmentRequest)));
  }

  listMyShipments(): Observable<ShipmentRequest[]> {
    return this.get<ShipmentRequestResource[]>(MatchmakingApi.SHIPMENT_REQUESTS_PATH).pipe(map(items => items.map(MatchmakingAssembler.toShipmentRequest)));
  }

  listOpenShipments(): Observable<ShipmentRequest[]> {
    return this.get<ShipmentRequestResource[]>(`${MatchmakingApi.SHIPMENT_REQUESTS_PATH}/open`)
      .pipe(map(items => items.map(MatchmakingAssembler.toShipmentRequest)));
  }

  createShipment(command: CreateShipmentRequestCommand): Observable<ShipmentRequest> {
    return this.post<ShipmentRequestResource>(MatchmakingApi.SHIPMENT_REQUESTS_PATH, { ...command }).pipe(map(MatchmakingAssembler.toShipmentRequest));
  }

  cancelShipment(id: string, reason: string): Observable<ShipmentRequest> {
    return this.post<ShipmentRequestResource>(`${MatchmakingApi.SHIPMENT_REQUESTS_PATH}/${id}/cancel`, { reason })
      .pipe(map(MatchmakingAssembler.toShipmentRequest));
  }

  suggestRoutes(shipmentId: string): Observable<ReturnRoute[]> {
    return this.get<ReturnRouteResource[]>(`${MatchmakingApi.SHIPMENT_REQUESTS_PATH}/${shipmentId}/suggested-routes`)
      .pipe(map(items => items.map(MatchmakingAssembler.toReturnRoute)));
  }

  listProposals(): Observable<MatchProposal[]> {
    return this.get<MatchProposalResource[]>(MatchmakingApi.MATCH_PROPOSALS_PATH).pipe(map(items => items.map(MatchmakingAssembler.toMatchProposal)));
  }

  getProposal(id: string): Observable<MatchProposal> {
    return this.get<MatchProposalResource>(`${MatchmakingApi.MATCH_PROPOSALS_PATH}/${id}`).pipe(map(MatchmakingAssembler.toMatchProposal));
  }

  createProposal(command: CreateMatchProposalCommand): Observable<MatchProposal> {
    return this.post<MatchProposalResource>(MatchmakingApi.MATCH_PROPOSALS_PATH, { ...command }).pipe(map(MatchmakingAssembler.toMatchProposal));
  }

  respondProposal(id: string, action: ProposalAction): Observable<MatchProposal> {
    return this.post<MatchProposalResource>(`${MatchmakingApi.MATCH_PROPOSALS_PATH}/${id}/${action}`).pipe(map(MatchmakingAssembler.toMatchProposal));
  }

  listMessages(proposalId: string): Observable<Message[]> {
    return this.get<MessageResource[]>(`${MatchmakingApi.MATCH_PROPOSALS_PATH}/${proposalId}/messages`)
      .pipe(map(items => items.map(MatchmakingAssembler.toMessage)));
  }

  sendMessage(proposalId: string, content: string): Observable<Message> {
    return this.post<MessageResource>(`${MatchmakingApi.MATCH_PROPOSALS_PATH}/${proposalId}/messages`, { content })
      .pipe(map(MatchmakingAssembler.toMessage));
  }
}
