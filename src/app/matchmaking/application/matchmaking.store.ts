import {computed, inject, Injectable, signal} from '@angular/core';
import {concat, defer, forkJoin, Observable, of, throwError} from 'rxjs';
import {map, switchMap, tap, toArray} from 'rxjs/operators';
import {MatchmakingApi} from '../infrastructure/matchmaking-api';
import {ReturnRouteAssembler} from '../infrastructure/return-route-assembler';
import {FreightRequestAssembler} from '../infrastructure/freight-request-assembler';
import {MatchProposalAssembler} from '../infrastructure/match-proposal-assembler';
import {ReturnRoute} from '../domain/model/return-route.entity';
import {FreightRequest} from '../domain/model/freight-request.entity';
import {MatchProposal} from '../domain/model/match-proposal.entity';
import {TimeWindow} from '../domain/model/time-window.value-object';
import {Cargo} from '../domain/model/cargo.value-object';
import {CargoType} from '../domain/model/cargo-type.value-object';
import {Detour} from '../domain/model/detour.value-object';
import {isParty, Party} from '../domain/model/party';
import {RouteMatchingService} from '../domain/services/route-matching.service';
import {Address} from '../../shared/domain/model/address.value-object';
import {Money} from '../../shared/domain/model/money.value-object';
import {currentMonthIso, todayIso} from '../../shared/domain/model/calendar';
import {byNewest, replaceManyById, upsertById} from '../../shared/application/collections';
import {NotificationStore} from '../../shared/application/notification.store';
import {IamStore} from '../../iam/application/iam.store';
import {ProfileStore} from '../../iam/application/profile.store';
import {BillingStore} from '../../billing/application/billing.store';
import {ExecutionStore} from '../../execution/application/execution.store';
import {Shipment} from '../../execution/domain/model/shipment.entity';

export interface AddressData {
  street: string;
  district: string;
}

export interface ReturnRouteData {
  vehicleId: number;
  origin: AddressData;
  destination: AddressData;
  departureDate: string;
  timeWindow: { start: string; end: string };
  availableWeightKg: number;
  availableVolumeM3: number;
  maxDetourKm: number;
  acceptedCargoTypes: string[];
}

export interface FreightRequestData {
  pickup: AddressData;
  delivery: AddressData;
  pickupDate: string;
  pickupWindow: { start: string; end: string };
  cargoType: string;
  weightKg: number;
  volumeM3: number;
  description: string;
  offeredRate: number | null;
}

export interface LoadSuggestion {
  request: FreightRequest;
  detour: Detour;
  proposal: MatchProposal | null;
}

export interface CarrierSuggestion {
  route: ReturnRoute;
  detour: Detour;
  proposal: MatchProposal | null;
}

export type SuggestionSort = 'detour' | 'rate' | 'weight';

export interface SuggestionFilters {
  cargoType?: string | null;
  maxDetourKm?: number | null;
  sortBy?: SuggestionSort;
}

@Injectable({providedIn: 'root'})
export class MatchmakingStore {
  private readonly matchmakingApi = inject(MatchmakingApi);
  private readonly iamStore = inject(IamStore);
  private readonly profileStore = inject(ProfileStore);
  private readonly billingStore = inject(BillingStore);
  private readonly executionStore = inject(ExecutionStore);
  private readonly notificationStore = inject(NotificationStore);

  private readonly returnRoutesSignal = signal<ReturnRoute[]>([]);

  private readonly freightRequestsSignal = signal<FreightRequest[]>([]);

  private readonly matchProposalsSignal = signal<MatchProposal[]>([]);

  private readonly loadingSignal = signal<boolean>(false);

  private readonly errorSignal = signal<string | null>(null);

  readonly returnRoutes = this.returnRoutesSignal.asReadonly();

  readonly freightRequests = this.freightRequestsSignal.asReadonly();

  readonly matchProposals = this.matchProposalsSignal.asReadonly();

  readonly loading = this.loadingSignal.asReadonly();

  readonly error = this.errorSignal.asReadonly();

  readonly myReturnRoutes = computed(() => this.returnRoutes()
    .filter(route => route.carrierId === this.iamStore.currentUserId())
    .sort(byNewest(route => route.departureDate)));

  readonly myActiveReturnRoutes = computed(() => this.myReturnRoutes().filter(route => route.status.isActive));

  readonly myFreightRequests = computed(() => this.freightRequests()
    .filter(request => request.merchantId === this.iamStore.currentUserId())
    .sort(byNewest(request => request.createdAt)));

  readonly myProposals = computed(() => {
    const userId = this.iamStore.currentUserId();
    return this.matchProposals()
      .filter(proposal => proposal.carrierId === userId || proposal.merchantId === userId)
      .sort(byNewest(proposal => proposal.updatedAt));
  });

  readonly proposalsAwaitingMe = computed(() => {
    const role = this.iamStore.currentRole();
    return this.myProposals().filter(proposal =>
      proposal.isAwaiting(role) || (role === 'merchant' && proposal.status.isAccepted));
  });

  readonly publicationsThisMonth = computed(() => {
    const month = currentMonthIso();
    const publications: { createdAt: string | null }[] = this.iamStore.isCarrier() ? this.myReturnRoutes() : this.myFreightRequests();
    return publications.filter(item => (item.createdAt ?? '').slice(0, 7) === month).length;
  });

  loadAll(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    forkJoin([
      this.matchmakingApi.getReturnRoutes(),
      this.matchmakingApi.getFreightRequests(),
      this.matchmakingApi.getMatchProposals()
    ]).subscribe({
      next: ([routes, requests, proposals]) => {
        this.returnRoutesSignal.set(routes);
        this.freightRequestsSignal.set(requests);
        this.matchProposalsSignal.set(proposals);
        this.loadingSignal.set(false);
        const awaiting = this.proposalsAwaitingMe().length;
        if (awaiting) this.notificationStore.notify({ severity: 'info', summaryKey: 'alerts.offers-waiting', params: { count: awaiting } });
      },
      error: (error: Error) => {
        this.errorSignal.set(error.message);
        this.loadingSignal.set(false);
      }
    });
  }

  getReturnRouteById(id: number): ReturnRoute | undefined {
    return this.returnRoutes().find(route => route.id === Number(id));
  }

  getFreightRequestById(id: number): FreightRequest | undefined {
    return this.freightRequests().find(request => request.id === Number(id));
  }

  getProposalById(id: number): MatchProposal | undefined {
    return this.matchProposals().find(proposal => proposal.id === Number(id));
  }

  proposalsForRequest(requestId: number): MatchProposal[] {
    return this.matchProposals().filter(proposal => proposal.freightRequestId === Number(requestId));
  }

  proposalsForRoute(routeId: number): MatchProposal[] {
    return this.matchProposals().filter(proposal => proposal.returnRouteId === Number(routeId));
  }

  publishReturnRoute(data: ReturnRouteData): Observable<ReturnRoute> {
    return defer(() => {
      const vehicle = this.profileStore.findVehicle(data.vehicleId);
      if (!vehicle) throw new Error('validation.vehicle-required');
      if (!vehicle.active) throw new Error('validation.vehicle-inactive');
      this.assertCanPublish();
      const route = ReturnRoute.create({
        today: todayIso(),
        vehicleCapacityKg: vehicle.capacity.weightKg,
        vehicleCapacityM3: vehicle.capacity.volumeM3,
        carrierId: this.iamStore.currentUserId() ?? 0,
        vehicleId: vehicle.id!,
        vehicleLabel: vehicle.label,
        origin: new Address(data.origin),
        destination: new Address(data.destination),
        departureDate: data.departureDate,
        timeWindow: new TimeWindow(data.timeWindow),
        availableWeightKg: data.availableWeightKg,
        availableVolumeM3: data.availableVolumeM3 ?? 0,
        maxDetourKm: data.maxDetourKm,
        acceptedCargoTypes: (data.acceptedCargoTypes ?? []).map(type => new CargoType(type))
      });
      return this.matchmakingApi.createReturnRoute(route);
    }).pipe(tap(created => this.returnRoutesSignal.update(routes => [...routes, created])));
  }

  closeReturnRoute(routeId: number): Observable<ReturnRoute> {
    return defer(() => {
      const current = this.getReturnRouteById(routeId);
      if (!current) throw new Error('validation.route-required');
      const route = ReturnRouteAssembler.clone(current);
      route.close();
      return this.matchmakingApi.updateReturnRoute(route);
    }).pipe(
      tap(updated => this.returnRoutesSignal.update(routes => upsertById(routes, updated))),
      switchMap(updated => this.closeProposals(this.proposalsForRoute(updated.id)).pipe(map(() => updated)))
    );
  }

  saveFreightRequest(data: FreightRequestData, publish: boolean, existingId: number | null = null): Observable<FreightRequest> {
    return defer(() => {
      const existing = existingId ? this.getFreightRequestById(existingId) : undefined;
      if (existingId && !existing) throw new Error('validation.request-required');
      if (existing && !existing.status.isDraft) throw new Error('validation.request-not-draft');
      if (publish) this.assertCanPublish();
      const request = this.buildFreightRequest(data, publish, existing);
      return existing ? this.matchmakingApi.updateFreightRequest(request) : this.matchmakingApi.createFreightRequest(request);
    }).pipe(tap(saved => this.freightRequestsSignal.update(requests => upsertById(requests, saved))));
  }

  publishFreightRequest(requestId: number): Observable<FreightRequest> {
    return this.mutateFreightRequest(requestId, request => {
      this.assertCanPublish();
      request.publish();
    });
  }

  cancelFreightRequest(requestId: number): Observable<FreightRequest> {
    return this.mutateFreightRequest(requestId, request => request.cancel()).pipe(
      switchMap(updated => this.closeProposals(this.proposalsForRequest(updated.id)).pipe(map(() => updated)))
    );
  }

  getLoadSuggestions(routeId: number, filters: SuggestionFilters = {}): LoadSuggestion[] {
    const route = this.getReturnRouteById(routeId);
    if (!route) return [];
    const maxDetourKm = filters.maxDetourKm ?? route.maxDetourKm;
    const suggestions = this.freightRequests()
      .filter(request => request.merchantId !== route.carrierId)
      .filter(request => !filters.cargoType || request.cargo.type.value === filters.cargoType)
      .map(request => ({ request, evaluation: RouteMatchingService.evaluate(route, request, { maxDetourKm }) }))
      .filter(item => item.evaluation.compatible)
      .map(item => ({
        request: item.request,
        detour: item.evaluation.detour,
        proposal: this.matchProposals().find(proposal => proposal.freightRequestId === item.request.id && proposal.returnRouteId === route.id) ?? null
      }));
    const sorters: Record<SuggestionSort, (a: LoadSuggestion, b: LoadSuggestion) => number> = {
      detour: (a, b) => a.detour.distanceKm - b.detour.distanceKm,
      rate: (a, b) => (b.request.offeredRate?.amount ?? 0) - (a.request.offeredRate?.amount ?? 0),
      weight: (a, b) => b.request.cargo.weightKg - a.request.cargo.weightKg
    };
    return suggestions.sort(sorters[filters.sortBy ?? 'detour']);
  }

  findCarriersFor(requestId: number): CarrierSuggestion[] {
    const request = this.getFreightRequestById(requestId);
    if (!request) return [];
    return this.returnRoutes()
      .filter(route => route.carrierId !== request.merchantId)
      .map(route => ({ route, evaluation: RouteMatchingService.evaluate(route, request) }))
      .filter(item => item.evaluation.compatible)
      .map(item => ({
        route: item.route,
        detour: item.evaluation.detour,
        proposal: this.matchProposals().find(proposal => proposal.freightRequestId === request.id && proposal.returnRouteId === item.route.id) ?? null
      }))
      .sort((a, b) => a.detour.distanceKm - b.detour.distanceKm);
  }

  sendProposal(props: { routeId: number; requestId: number; amount: number }): Observable<MatchProposal> {
    return defer(() => {
      const route = this.getReturnRouteById(props.routeId);
      const request = this.getFreightRequestById(props.requestId);
      if (!route) throw new Error('validation.route-required');
      if (!request) throw new Error('validation.request-required');
      const duplicated = this.matchProposals().some(proposal =>
        proposal.freightRequestId === request.id && proposal.returnRouteId === route.id && proposal.status.isOpen);
      if (duplicated) throw new Error('validation.proposal-already-exists');
      const evaluation = RouteMatchingService.evaluate(route, request);
      if (!evaluation.compatible) throw new Error(evaluation.reasons[0]);
      const proposal = MatchProposal.create({
        freightRequest: request,
        returnRoute: route,
        rate: new Money({ amount: props.amount }),
        by: this.currentParty(),
        detour: evaluation.detour
      });
      return this.matchmakingApi.createMatchProposal(proposal);
    }).pipe(tap(created => this.matchProposalsSignal.update(proposals => [...proposals, created])));
  }

  acceptProposal(proposalId: number): Observable<MatchProposal> {
    return this.mutateProposal(proposalId, proposal => proposal.accept(this.currentParty()));
  }

  counterProposal(proposalId: number, amount: number): Observable<MatchProposal> {
    return this.mutateProposal(proposalId, proposal => proposal.counter(new Money({ amount }), this.currentParty()));
  }

  rejectProposal(proposalId: number): Observable<MatchProposal> {
    return this.mutateProposal(proposalId, proposal => proposal.reject(this.currentParty()));
  }

  confirmMatch(proposalId: number): Observable<Shipment> {
    return defer(() => {
      const current = this.getProposalById(proposalId);
      const currentRequest = current ? this.getFreightRequestById(current.freightRequestId) : undefined;
      const currentRoute = current ? this.getReturnRouteById(current.returnRouteId) : undefined;
      if (!current || !currentRequest || !currentRoute) throw new Error('validation.request-required');
      if (!currentRequest.status.isOpen) throw new Error('validation.request-not-open');
      if (!currentRoute.status.isActive || !currentRoute.canCarry(currentRequest.cargo.weightKg, currentRequest.cargo.volumeM3)) {
        throw new Error('validation.route-capacity-insufficient');
      }
      const proposal = MatchProposalAssembler.clone(current);
      const request = FreightRequestAssembler.clone(currentRequest);
      const route = ReturnRouteAssembler.clone(currentRoute);
      proposal.confirm(this.currentParty());
      request.markMatched();
      route.reserveCapacity(request.cargo.weightKg, request.cargo.volumeM3);
      const competitors = this.proposalsForRequest(request.id).filter(item => item.id !== proposal.id && item.status.isOpen);
      return concat(
        this.matchmakingApi.updateMatchProposal(proposal),
        this.matchmakingApi.updateFreightRequest(request),
        this.matchmakingApi.updateReturnRoute(route)
      ).pipe(
        toArray(),
        map(saved => [saved[0] as MatchProposal, saved[1] as FreightRequest, saved[2] as ReturnRoute] as const),
        tap(([savedProposal, savedRequest, savedRoute]) => {
          this.matchProposalsSignal.update(proposals => upsertById(proposals, savedProposal));
          this.freightRequestsSignal.update(requests => upsertById(requests, savedRequest));
          this.returnRoutesSignal.update(routes => upsertById(routes, savedRoute));
        }),
        switchMap(([savedProposal, savedRequest, savedRoute]) => this.closeProposals(competitors).pipe(
          switchMap(() => this.openShipmentFor(savedProposal, savedRequest, savedRoute))
        )),
        tap(() => this.notificationStore.notify({ severity: 'success', summaryKey: 'alerts.match-confirmed', params: { code: request.code } }))
      );
    });
  }

  private openShipmentFor(proposal: MatchProposal, request: FreightRequest, route: ReturnRoute): Observable<Shipment> {
    const carrierProfile = this.profileStore.carrierProfileOf(proposal.carrierId);
    const merchantProfile = this.profileStore.merchantProfileOf(proposal.merchantId);
    return this.executionStore.openShipment({
      proposalId: proposal.id,
      freightRequestId: request.id,
      returnRouteId: route.id,
      carrierId: proposal.carrierId,
      carrierName: carrierProfile?.fullName ?? '',
      carrierPhone: carrierProfile?.phone.value ?? '',
      vehicleLabel: route.vehicleLabel,
      merchantId: proposal.merchantId,
      merchantName: merchantProfile?.businessName ?? '',
      merchantPhone: merchantProfile?.phone.value ?? '',
      pickup: request.pickup,
      delivery: request.delivery,
      pickupDate: request.pickupDate,
      pickupWindow: request.pickupWindow.label,
      cargoDescription: request.cargo.description,
      cargoType: request.cargo.type.value,
      weightKg: request.cargo.weightKg,
      rate: proposal.currentRate
    });
  }

  private closeProposals(proposals: MatchProposal[]): Observable<MatchProposal[]> {
    const open = proposals.filter(proposal => proposal.status.isOpen).map(proposal => {
      const copy = MatchProposalAssembler.clone(proposal);
      copy.close();
      return this.matchmakingApi.updateMatchProposal(copy);
    });
    if (!open.length) return of([]);
    return concat(...open).pipe(
      toArray(),
      tap(saved => this.matchProposalsSignal.update(current => replaceManyById(current, saved)))
    );
  }

  private mutateProposal(proposalId: number, mutation: (proposal: MatchProposal) => void): Observable<MatchProposal> {
    return defer(() => {
      const current = this.getProposalById(proposalId);
      if (!current) return throwError(() => new Error('validation.request-required'));
      const proposal = MatchProposalAssembler.clone(current);
      mutation(proposal);
      return this.matchmakingApi.updateMatchProposal(proposal);
    }).pipe(tap(updated => this.matchProposalsSignal.update(proposals => upsertById(proposals, updated))));
  }

  private mutateFreightRequest(requestId: number, mutation: (request: FreightRequest) => void): Observable<FreightRequest> {
    return defer(() => {
      const current = this.getFreightRequestById(requestId);
      if (!current) return throwError(() => new Error('validation.request-required'));
      const request = FreightRequestAssembler.clone(current);
      mutation(request);
      return this.matchmakingApi.updateFreightRequest(request);
    }).pipe(tap(updated => this.freightRequestsSignal.update(requests => upsertById(requests, updated))));
  }

  private buildFreightRequest(data: FreightRequestData, publish: boolean, existing?: FreightRequest): FreightRequest {
    const hasRate = data.offeredRate !== null && data.offeredRate !== undefined && `${data.offeredRate}` !== '';
    return FreightRequest.create({
      today: todayIso(),
      publish,
      id: existing?.id,
      code: existing?.code,
      createdAt: existing?.createdAt,
      merchantId: this.iamStore.currentUserId() ?? 0,
      pickup: new Address(data.pickup),
      delivery: new Address(data.delivery),
      pickupDate: data.pickupDate,
      pickupWindow: new TimeWindow(data.pickupWindow),
      cargo: new Cargo({
        type: new CargoType(data.cargoType),
        weightKg: data.weightKg,
        volumeM3: data.volumeM3 ?? 0,
        description: data.description
      }),
      offeredRate: hasRate ? new Money({ amount: Number(data.offeredRate) }) : null
    });
  }

  private currentParty(): Party {
    const role = this.iamStore.currentRole();
    if (!isParty(role)) throw new Error('validation.party-invalid');
    return role;
  }

  private assertCanPublish(): void {
    if (!this.billingStore.canPublish(this.publicationsThisMonth())) throw new Error('validation.publication-limit-reached');
  }
}
