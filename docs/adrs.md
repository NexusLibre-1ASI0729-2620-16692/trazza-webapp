# Architecture Decision Records (ADRs)

## Overview
This document records the key architectural decisions made for the Trazza web application developed by NexusLibre. Each record follows standard Architecture Decision Record (ADR) practices (Michael Nygard and MADR conventions) to provide context, rationale and consequences.

---

## Table of Contents
- [ADR-001: Domain-Driven Design (DDD) Layered Architecture with the Trazza Bounded Contexts](#adr-001-domain-driven-design-ddd-layered-architecture-with-the-trazza-bounded-contexts)
- [ADR-002: Core Frontend Framework Selection: Angular 22 with TypeScript and Standalone Components](#adr-002-core-frontend-framework-selection-angular-22-with-typescript-and-standalone-components)
- [ADR-003: Signal-Based Stores in the Application Layer](#adr-003-signal-based-stores-in-the-application-layer)
- [ADR-004: UI Component Framework Selection: Angular Material 3](#adr-004-ui-component-framework-selection-angular-material-3)
- [ADR-005: Static Assembler (Data Mapper) Pattern and Typed Resources](#adr-005-static-assembler-data-mapper-pattern-and-typed-resources)
- [ADR-006: HttpClient, Functional Interceptor and Generic Endpoint Abstraction](#adr-006-httpclient-functional-interceptor-and-generic-endpoint-abstraction)
- [ADR-007: Route Protection and Role-Based Navigation with Functional Guards](#adr-007-route-protection-and-role-based-navigation-with-functional-guards)
- [ADR-008: Internationalization with ngx-translate](#adr-008-internationalization-with-ngx-translate)
- [ADR-009: Native ECMAScript Private Fields and Invariants in Constructors](#adr-009-native-ecmascript-private-fields-and-invariants-in-constructors)
- [ADR-010: Shared Kernel and Cross-Context Collaboration through Application Stores](#adr-010-shared-kernel-and-cross-context-collaboration-through-application-stores)
- [ADR-011: Route Matching as a Domain Service with District-Based Distance Estimation](#adr-011-route-matching-as-a-domain-service-with-district-based-distance-estimation)
- [ADR-012: External Services Behind Infrastructure Adapters and a Mock API](#adr-012-external-services-behind-infrastructure-adapters-and-a-mock-api)
- [ADR-013: OnPush Change Detection and Signal Inputs/Outputs](#adr-013-onpush-change-detection-and-signal-inputsoutputs)
- [ADR-014: Trip Tracking with Visibility-Aware Polling instead of WebSockets](#adr-014-trip-tracking-with-visibility-aware-polling-instead-of-websockets)

---

## ADR-001: Domain-Driven Design (DDD) Layered Architecture with the Trazza Bounded Contexts

### Status
Accepted

### Context
Trazza connects carriers with empty return trips and merchants (MSMEs) who need to ship goods in Metropolitan Lima. The domain covers identity and profiles, route matching and rate negotiation, trip execution and monitoring, subscription billing and reputation. Each area has its own language and rules, and a flat structure (`/components`, `/services`) would mix them and leak business logic into the UI.

### Decision
Structure `src/app` around the bounded contexts of the Trazza domain model plus a shared kernel:
- `iam` – IAM & Profiles.
- `matchmaking` – Matchmaking & Routing (core domain).
- `execution` – Service Execution & Monitoring.
- `billing` – Payment & Billing.
- `reputation` – Loyalty & Reputation.
- `shared` – Shared kernel, base infrastructure and application shell.

Every bounded context enforces four layers:
1. **Domain** (`domain/model`, `domain/services`): entities, aggregates, value objects, commands and domain services written as framework-free TypeScript classes.
2. **Application** (`application`): one or more signal stores per context that orchestrate use cases.
3. **Infrastructure** (`infrastructure`): resources and responses, static assemblers, API endpoints, API facades, adapters, guards and interceptors.
4. **Presentation** (`presentation`): standalone views, components, dialogs and route files.

### Consequences
- **Positive:** high cohesion per context, explicit ubiquitous language per folder and a core domain that evolves without touching generic contexts.
- **Negative:** more files (assemblers, value objects, resources) than binding the API directly to templates.

---

## ADR-002: Core Frontend Framework Selection: Angular 22 with TypeScript and Standalone Components

### Status
Accepted

### Context
The course *Aplicaciones Web* requires Angular and TypeScript, following the structure of the course learning center. The application needs strict typing, dependency injection, routing with lazy loading and an opinionated project structure.

### Decision
- Use **Angular 22** with **TypeScript 6** in strict mode.
- Use **standalone components** only (no `NgModule`), `inject()` for dependency injection and the new control flow (`@if`, `@for`).
- Lazy load each bounded context with `loadChildren` and each view with `loadComponent`.
- Bind route parameters and query parameters to component inputs with `withComponentInputBinding()`.

### Consequences
- **Positive:** smaller bundles, explicit imports per component, compile-time template checks.
- **Negative:** every component must declare its imports explicitly.

---

## ADR-003: Signal-Based Stores in the Application Layer

### Status
Accepted

### Context
Several views share the same state (routes, requests, proposals, shipments, ratings) and must react to changes made by other views and by other contexts.

### Decision
- Create one `@Injectable({ providedIn: 'root' })` store per use-case area: `IamStore`, `ProfileStore`, `MatchmakingStore`, `ExecutionStore`, `BillingStore`, `ReputationStore` and `NotificationStore`.
- Keep `WritableSignal` fields private and expose read-only signals with `asReadonly()` and derived state with `computed()`.
- Load operations subscribe inside the store (as in the learning center); command operations return an `Observable` built with `defer()`, so domain validation errors and HTTP errors reach the view through the same `error` channel.
- Before mutating an aggregate, the store clones it through its assembler, applies the domain behavior to the copy, persists it and replaces the instance in the signal with the entity returned by the API. Signals always receive a new reference and a failed request never leaves a half-mutated aggregate in memory.

### Consequences
- **Positive:** fine-grained reactivity that works with `OnPush`, no external state library and predictable mutations.
- **Negative:** developers must follow the clone-mutate-persist-replace convention.

---

## ADR-004: UI Component Framework Selection: Angular Material 3

### Status
Accepted

### Context
The UI must follow the Trazza Figma design (primary blue `#0037b0`, light surface `#f7f8ff`, white sidebar) and be accessible and responsive.

### Decision
- Use **Angular Material 22** with the Material 3 theme API (`mat.theme`) in `src/material-theme.scss`, overriding the primary and surface tokens with the Trazza palette and using component overrides for toolbar, sidenav, card, buttons and form fields.
- Use Material components for layout (`mat-sidenav`, `mat-toolbar`), data (`mat-table`, `mat-paginator`), forms (`mat-form-field`, `mat-select`, `mat-datepicker`, `mat-chip-listbox`, `mat-radio-group`, `mat-slide-toggle`), feedback (`mat-snack-bar`, `mat-dialog`, `mat-progress-bar`, `mat-badge`) and navigation (`mat-menu`, `mat-button-toggle`).
- Keep a small set of global utility classes in `src/styles.css` for page headers, panels, grids and status tags.

### Consequences
- **Positive:** accessible components with keyboard support and ARIA by default, consistent design tokens.
- **Negative:** some Figma details need custom CSS on top of Material.

---

## ADR-005: Static Assembler (Data Mapper) Pattern and Typed Resources

### Status
Accepted

### Context
The REST resources (plain JSON) differ from the domain model (entities and value objects with invariants). Templates must never work with raw JSON.

### Decision
- Describe every API payload with a `*Resource` interface (extending `BaseResource`) and its collection envelope with a `*Response` interface (extending `BaseResponse`).
- Implement one **static assembler** per aggregate (`UserAssembler`, `CarrierProfileAssembler`, `ReturnRouteAssembler`, `ShipmentAssembler`, `PaymentTransactionAssembler`, `RatingAssembler`, ...) with `toEntityFromResource`, `toResourceFromEntity` and `toEntitiesFromResponse`. Shared value objects use `SharedAssembler`.
- The class itself (`typeof XAssembler`) satisfies the generic `BaseAssembler` contract, so it is passed to `BaseApiEndpoint` without creating instances.
- Assemblers also provide `clone()` used by the stores (ADR-003).

### Consequences
- **Positive:** domain objects are always valid, API changes stay inside infrastructure.
- **Negative:** each new field requires updating the resource, the assembler and the entity.

---

## ADR-006: HttpClient, Functional Interceptor and Generic Endpoint Abstraction

### Status
Accepted

### Context
All contexts perform the same CRUD operations against `/api/v1` and must attach the session token.

### Decision
- `BaseApiEndpoint<TEntity, TResource, TResponse, TAssembler>` wraps `HttpClient` with `getAll(filters)`, `getById`, `create`, `update` and `delete`, maps results with the assembler and converts HTTP failures into i18n keys through `ErrorHandlingEnabledBaseType` (`errors.network` when the server is unreachable).
- Each context exposes an `@Injectable` facade (`IamApi`, `MatchmakingApi`, `ExecutionApi`, `BillingApi`, `ReputationApi`) extending `BaseApi` that composes its endpoints.
- `iamInterceptor` (functional `HttpInterceptorFn`) adds `Authorization: Bearer <token>` when a session exists.
- Endpoint paths and base URLs live in `src/environments`.

### Consequences
- **Positive:** one place to change HTTP behavior, typed observables everywhere.
- **Negative:** special operations (sign-up, partial user update) need small endpoint extensions.

---

## ADR-007: Route Protection and Role-Based Navigation with Functional Guards

### Status
Accepted

### Context
Carriers and merchants see different menus and screens. Private routes must not be reachable without a session.

### Decision
- `iamGuard` (`CanActivateFn`) redirects to `/iam/sign-in` without a session and to `/dashboard` when `route.data.roles` does not include the current role.
- `publicOnlyGuard` keeps signed-in users away from sign-in and sign-up.
- `SideMenu` renders a different option list per role.
- `TrazzaTitleStrategy` translates the route `title` key and updates the document title and the top bar when the language changes.

### Consequences
- **Positive:** declarative protection in the route files, consistent titles in both languages.
- **Negative:** client-side guards are not a security boundary; the backend must validate again.

---

## ADR-008: Internationalization with ngx-translate

### Status
Accepted

### Context
The statement requires English and Spanish, with English as default.

### Decision
- Use `@ngx-translate/core` with `@ngx-translate/http-loader` reading `public/i18n/en.json` and `public/i18n/es.json`.
- Domain and validation errors are thrown as translation keys (`validation.*`, `matching.*`, `errors.*`) and translated in the presentation layer by `FeedbackService`.
- `LocaleService` exposes the current language as a signal so date pipes (`trazzaDate`, `trazzaTime`) re-render with `es-PE` or `en-GB` formats.

### Consequences
- **Positive:** the domain stays language-agnostic, switching language updates every label instantly.
- **Negative:** every new message needs keys in both files.

---

## ADR-009: Native ECMAScript Private Fields and Invariants in Constructors

### Status
Accepted

### Context
Entities and value objects must protect their state at runtime, not only at compile time.

### Decision
- Use native private fields (`readonly #amount: number`) in every entity, value object and command; expose read access with getters.
- Value objects are immutable (`readonly #`) and return new instances (`Money.add`, `GeoLocation.moveTowards`).
- Entities validate their invariants in the constructor and change state only through intention-revealing methods (`MatchProposal.counter`, `Shipment.confirmDelivery`, `ReturnRoute.reserveCapacity`).
- Factory methods (`ReturnRoute.create`, `FreightRequest.create`, `MatchProposal.create`, `Shipment.open`, `PaymentTransaction.create`, `Receipt.issue`) apply creation rules.

### Consequences
- **Positive:** invalid objects cannot exist and state cannot be modified from outside.
- **Negative:** private fields cannot be inspected by structural serializers; assemblers must map them explicitly.

---

## ADR-010: Shared Kernel and Cross-Context Collaboration through Application Stores

### Status
Accepted

### Context
Some concepts are used by several contexts (money, addresses, locations) and some use cases span contexts: confirming a match opens a shipment, publishing must respect the subscription plan and rating requires a delivered shipment.

### Decision
- The shared kernel (`shared/domain/model`) holds `Money`, `Address`, `GeoLocation`, `LIMA_DISTRICTS` and calendar helpers.
- Contexts collaborate in the application layer: `MatchmakingStore.confirmMatch` calls `ExecutionStore.openShipment` with a snapshot of the match, publishing asks `BillingStore.canPublish`, and `ReputationStore.submitRating` checks the shipment status.
- Execution stores snapshots (names, phones, vehicle label, rate) instead of references to IAM or Matchmaking aggregates.

### Consequences
- **Positive:** aggregates stay consistent inside their context; integration points are explicit.
- **Negative:** snapshots may become outdated if profiles change after the match.

---

## ADR-011: Route Matching as a Domain Service with District-Based Distance Estimation

### Status
Accepted

### Context
Suggesting loads that fit a return route involves two aggregates (`ReturnRoute` and `FreightRequest`), so the rule does not belong to either of them.

### Decision
Implement `RouteMatchingService` in `matchmaking/domain/services`. It estimates road distances from district centroids (haversine distance × 1.3 road factor, 30 km/h average speed), calculates the detour (origin → pickup → delivery → destination minus origin → destination) and evaluates compatibility: same date, overlapping time windows, accepted cargo type, enough free capacity and a detour within the route limit. Failed rules are returned as `matching.*` keys.

### Consequences
- **Positive:** explicit and testable policy reused by load suggestions, carrier search and proposal creation.
- **Negative:** district-level estimates are approximate.

---

## ADR-012: External Services Behind Infrastructure Adapters and a Mock API

### Status
Accepted

### Context
The platform depends on a REST backend, a payment gateway, maps and GPS telemetry. Only some of them are available in the academic environment, but every use case must be demonstrable end to end.

### Decision
- Use `json-server` (`server/db.json`, `server/routes.json`) as the REST backend with the `/api/v1` prefix.
- Hide the payment gateway behind the `PaymentGateway` adapter (approves valid cards, declines the `…0002` test card).
- Integrate **OpenStreetMap** as the external third-party map service through the `MapProvider` adapter: the tracking map offers a route sketch and an embedded street map with the current position, plus a link to openstreetmap.org.
- Model location updates as a use case (`ExecutionStore.shareLocation`) that accepts a real `GeoLocation` and falls back to a simulated one.

### Consequences
- **Positive:** every flow (match, payment, tracking, deviation alert) can be demonstrated locally; replacing a provider only affects infrastructure.
- **Negative:** the mock API validates credentials with query parameters and stores plain passwords; it must never be used in production.

---

## ADR-013: OnPush Change Detection and Signal Inputs/Outputs

### Status
Accepted

### Context
Views read derived state from several stores. Default change detection would check every component on every event.

### Decision
- Every component declares `changeDetection: ChangeDetectionStrategy.OnPush`.
- Component communication uses `input()`, `input.required()`, `output()`, `linkedSignal()` and `viewChild()`; view state uses `signal()` and `computed()`.
- Reactive form values that drive previews are converted with `toSignal(form.valueChanges)`.

### Consequences
- **Positive:** predictable rendering driven by signals and better performance.
- **Negative:** plain mutable fields do not refresh the view; state must live in signals.

---

## ADR-014: Trip Tracking with Visibility-Aware Polling instead of WebSockets

### Status
Accepted

### Context
The trip detail must show the merchant the position of the truck, the deviation alerts and the status changes a few seconds after they happen. The Trazza Platform API is a REST API and does not expose a push channel, so the web application has to ask for the data.

### Decision
- `TripDetail` and the proposal chat call `startPolling(action, intervalMs)` from `shared/presentation/services/polling.ts`.
- The action runs on an interval (15 seconds for the trip, `TripDetail.POLL_INTERVAL_MS`) and only when `document.visibilityState === 'visible'`.
- The trip detail reloads only while the trip is active (`Trip.isActive`); once it is confirmed or cancelled there is nothing left to follow.
- The interval is cleared through `DestroyRef.onDestroy` when the component is destroyed.

### Consequences
- **Positive:** no extra infrastructure on the platform, works behind any proxy and is simple to test.
- **Positive:** hidden tabs do not generate traffic.
- **Negative:** information can be up to 15 seconds old; the carrier's own view is updated immediately when it records a point.
- **Negative:** every open trip detail makes four requests per cycle; if the number of simultaneous users grows, a push channel (server-sent events or WebSockets) should replace the polling.
