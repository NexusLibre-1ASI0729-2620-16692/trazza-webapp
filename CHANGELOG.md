# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Unit tests for the `execution` bounded context: domain entities and commands, `ExecutionStore`, `ExecutionApi`, routes, `TripList`, `IotDeviceList` and `IncidentPanel`.
- Unit tests for `FeedbackService` and the collection helpers of the shared kernel.
- Documentation of the `execution` bounded context, its sequence diagram and ADR-014 on visibility-aware polling.

## [1.2.0] - 2026-11-14

### Changed
- Matchmaking, execution, billing, reputation and IAM now consume the Trazza Platform API (Spring Boot, DDD) instead of the json-server mock: new stores, entities, assemblers, views and dialogs for each bounded context.
- Dashboard and layout load their data from the new stores.
- Shared kernel updated: `PlatformApi`, `ApiError`, `FeedbackService.attempt`, base assembler and endpoint, and status tags that use the API statuses.

### Added
- Leaflet map components (`MapPicker`, `RouteMap`), `Polling`, `StarRating`, `PromptDialog` and the date-time and money pipes.
- Loyalty points, drivers and saved addresses, subscriptions and settlements, IoT devices and the incident panel.
- English and Spanish labels for matchmaking and execution, and translated API error messages.

## [1.0.0] - 2026-10-06

### Added
- **Angular 22 + TypeScript migration** of the Trazza web application following the structure and rules of the course learning center: standalone components, `inject()`, Angular Signals, `OnPush` change detection, Angular Material 3 and `@ngx-translate/core`.
- **Shared Kernel**: `Money`, `Address`, `GeoLocation` value objects, `LIMA_DISTRICTS` catalog, `BaseEntity`, `BaseApi`, `BaseApiEndpoint`, `BaseAssembler`, `BaseResponse`, `ErrorHandlingEnabledBaseType`, `SharedAssembler`, `NotificationStore`, application shell (`Layout`, `SideMenu`, `TopBar`, `LanguageSwitcher`, `FooterContent`), `BaseForm`, `AddressFields`, `ConfirmDialog`, `EmptyState`, `StatusTag`, locale-aware pipes, `FeedbackService`, `LocaleService`, `TrazzaTitleStrategy`, `Dashboard` and `PageNotFound`.
- **IAM & Profiles**: `User`, `CarrierProfile`, `Vehicle`, `MerchantProfile`, value objects (`Email`, `Phone`, `Dni`, `Ruc`, `LicensePlate`, `LoadCapacity`, `UserRole`), `SignInCommand`, `SignUpCommand`, `IamStore`, `ProfileStore`, `IamApi`, endpoints, static assemblers, `iamGuard`, `publicOnlyGuard`, `iamInterceptor` and views for sign in, sign up, profile and vehicles.
- **Matchmaking & Routing**: `ReturnRoute`, `FreightRequest`, `MatchProposal`, value objects (`TimeWindow`, `Cargo`, `CargoType`, `Detour`, statuses), `RouteMatchingService`, `MatchmakingStore`, `MatchmakingApi` and views for return routes, load suggestions, load detail, freight requests, carrier search and offers.
- **Service Execution & Monitoring**: `Shipment`, `Incident`, `ShipmentEvent`, `ShipmentStatus`, `IncidentType`, `ExecutionStore`, `ExecutionApi`, `MapProvider` (OpenStreetMap) and views for active trip, shipment tracking and histories.
- **Payment & Billing**: `PaymentTransaction`, `Receipt`, `SubscriptionPlan`, `PaymentMethod`, `PaymentStatus`, `ReceiptType`, `BillingStore`, `BillingApi`, `PaymentGateway`, plan & billing view, checkout dialog and receipt dialog.
- **Loyalty & Reputation**: `Rating`, `Score`, `RatingTarget`, `ReputationStore`, `ReputationApi`, rating list, rating dialog and star rating.
- **Internationalization**: English (default) and Spanish dictionaries in `public/i18n`.
- **Mock API**: `json-server` seed data and `/api/v1` routes in `server/`.
- **Tests**: unit tests for the root component, `Money`, `RouteMatchingService` and `PaymentMethod`.
- **Documentation**: README, CONTRIBUTING, ADRs, user stories with RTM and PlantUML class diagram.

### Changed
- Organization branding updated from StackRoot to NexusLibre.
- Domain state now uses native ECMAScript `#` private fields instead of underscore-prefixed fields.
- Stores clone aggregates through their assemblers before applying domain behavior and replace them with the instance returned by the API.
