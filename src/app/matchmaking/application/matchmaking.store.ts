import {computed, inject, Injectable, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {MatchmakingApi, ProposalAction} from '../infrastructure/matchmaking-api';
import {ReturnRoute} from '../domain/model/return-route.entity';
import {ShipmentRequest} from '../domain/model/shipment-request.entity';
import {MatchProposal} from '../domain/model/match-proposal.entity';
import {Message} from '../domain/model/message.entity';
import {CreateReturnRouteCommand} from '../domain/commands/create-return-route.command';
import {CreateShipmentRequestCommand} from '../domain/commands/create-shipment-request.command';
import {CreateMatchProposalCommand} from '../domain/commands/create-match-proposal.command';
import {upsertById} from '../../shared/application/collections';

/** Return routes, shipment requests and the proposals that match them. */
@Injectable({providedIn: 'root'})
export class MatchmakingStore {
  private readonly api = inject(MatchmakingApi);

  private readonly myRoutesSignal = signal<ReturnRoute[]>([]);
  private readonly myShipmentsSignal = signal<ShipmentRequest[]>([]);
  private readonly openShipmentsSignal = signal<ShipmentRequest[]>([]);
  private readonly proposalsSignal = signal<MatchProposal[]>([]);
  private readonly loadedSignal = signal(false);

  readonly myRoutes = this.myRoutesSignal.asReadonly();
  readonly myShipments = this.myShipmentsSignal.asReadonly();
  readonly openShipments = this.openShipmentsSignal.asReadonly();
  readonly proposals = this.proposalsSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  readonly openRoutes = computed(() => this.myRoutes().filter(route => route.isOpen));
  readonly myOpenShipments = computed(() => this.myShipments().filter(shipment => shipment.isOpen));
  readonly pendingProposals = computed(() => this.proposals().filter(proposal => proposal.isPending));

  async loadAll(role: string): Promise<void> {
    await Promise.all([role === 'CARRIER' ? this.loadCarrierData() : this.loadMerchantData(), this.loadProposals()]);
    this.loadedSignal.set(true);
  }

  async loadCarrierData(): Promise<void> {
    const [routes, open] = await Promise.all([firstValueFrom(this.api.listMyRoutes()), firstValueFrom(this.api.listOpenShipments())]);
    this.myRoutesSignal.set(routes);
    this.openShipmentsSignal.set(open);
  }

  async loadMerchantData(): Promise<void> {
    this.myShipmentsSignal.set(await firstValueFrom(this.api.listMyShipments()));
  }

  async loadProposals(): Promise<void> {
    this.proposalsSignal.set(await firstValueFrom(this.api.listProposals()));
  }

  getRoute(id: string): Promise<ReturnRoute> {
    return firstValueFrom(this.api.getRoute(id));
  }

  async createRoute(command: CreateReturnRouteCommand): Promise<ReturnRoute> {
    const route = await firstValueFrom(this.api.createRoute(command));
    this.myRoutesSignal.update(routes => [route, ...routes]);
    return route;
  }

  async cancelRoute(route: ReturnRoute): Promise<void> {
    const updated = await firstValueFrom(this.api.cancelRoute(route.id));
    this.myRoutesSignal.update(routes => upsertById(routes, updated));
  }

  suggestShipments(routeId: string): Promise<ShipmentRequest[]> {
    return firstValueFrom(this.api.suggestShipments(routeId));
  }

  async createShipment(command: CreateShipmentRequestCommand): Promise<ShipmentRequest> {
    const shipment = await firstValueFrom(this.api.createShipment(command));
    this.myShipmentsSignal.update(shipments => [shipment, ...shipments]);
    return shipment;
  }

  async cancelShipment(shipment: ShipmentRequest, reason: string): Promise<void> {
    const updated = await firstValueFrom(this.api.cancelShipment(shipment.id, reason));
    this.myShipmentsSignal.update(shipments => upsertById(shipments, updated));
  }

  suggestRoutes(shipmentId: string): Promise<ReturnRoute[]> {
    return firstValueFrom(this.api.suggestRoutes(shipmentId));
  }

  getProposal(id: string): Promise<MatchProposal> {
    return firstValueFrom(this.api.getProposal(id));
  }

  async createProposal(command: CreateMatchProposalCommand): Promise<MatchProposal> {
    const proposal = await firstValueFrom(this.api.createProposal(command));
    this.proposalsSignal.update(proposals => [proposal, ...proposals]);
    return proposal;
  }

  async respondProposal(proposal: MatchProposal, action: ProposalAction): Promise<MatchProposal> {
    const updated = await firstValueFrom(this.api.respondProposal(proposal.id, action));
    this.proposalsSignal.update(proposals => upsertById(proposals, updated));
    return updated;
  }

  listMessages(proposalId: string): Promise<Message[]> {
    return firstValueFrom(this.api.listMessages(proposalId));
  }

  sendMessage(proposalId: string, content: string): Promise<Message> {
    return firstValueFrom(this.api.sendMessage(proposalId, content));
  }
}
