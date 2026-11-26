# Service Execution & Monitoring (`execution`)

Bounded context of the Trazza web application that follows an accepted proposal until the merchant confirms the delivery.
It owns the **trip**, its GPS tracking, the deviation alerts the platform raises, the incidents reported on it and the IoT
devices that Trazza loans to carriers with an IoT plan.

## Layers

| Layer | Files | Responsibility |
|:--|:--|:--|
| `domain` | `Trip`, `TripStatus`, `TrackingPoint`, `DeviationAlert`, `Incident`, `IotDevice`, `TripStatusChange`, `ReportIncidentCommand` | Trip rules (who can do what in each state) and validation of the incident command. No Angular, HTTP or UI. |
| `application` | `ExecutionStore` | Signals with the user's trips, the active ones, the open alerts and the IoT devices. Replaces a trip with the instance returned by the API. |
| `infrastructure` | `ExecutionApi`, `execution-resources.ts` | Typed calls to `/trips` and `/iot-devices` and the mapping of each resource to its domain class. |
| `presentation` | `TripList`, `TripDetail`, `IotDeviceList`, `IncidentPanel`, `execution.routes.ts` | Standalone `OnPush` components with Angular Material and `@ngx-translate/core`. |

## Trip life cycle

`SCHEDULED → PICKED_UP → IN_TRANSIT → DELIVERED → CONFIRMED`, or `CANCELLED` while the trip is still scheduled.

| Action | Who | Allowed when | Trip getter |
|:--|:--|:--|:--|
| Assign a driver | Carrier | `SCHEDULED` | `canAssignDriver` |
| Pick up the cargo | Carrier | `SCHEDULED` | `canPickUp` |
| Share location and track | Carrier | `PICKED_UP` or `IN_TRANSIT` | `canTrack` |
| Deliver | Carrier | `PICKED_UP` or `IN_TRANSIT` | `canDeliver` |
| Confirm reception | Merchant | `DELIVERED` | `canConfirm` |
| Cancel | Carrier or merchant | `SCHEDULED` | `canCancel` |

A trip is **active** until it is confirmed or cancelled (`ACTIVE_TRIP_STATUSES`). A merchant who cancels after the
departure time may owe the carrier a lost-profit compensation (`cancellationMayCauseCompensation`).

## Platform API used by `ExecutionApi`

| Method | Path | Purpose |
|:--|:--|:--|
| `GET` | `/trips` | Trips of the signed-in user |
| `GET` | `/trips/{id}` | One trip |
| `GET` | `/trips/{id}/status-history` | Status changes of the trip |
| `PUT` | `/trips/{id}/driver` | Assign a driver |
| `POST` | `/trips/{id}/pick-up`, `/deliver`, `/confirm` | Move the trip through its life cycle |
| `POST` | `/trips/{id}/cancel` | Cancel with a reason |
| `GET` / `POST` | `/trips/{id}/tracking-points` | List or record GPS points (`source: PHONE`) |
| `GET` | `/trips/{id}/deviation-alerts` | Deviation alerts |
| `POST` | `/trips/{id}/deviation-alerts/{alertId}/acknowledge` | Acknowledge an alert |
| `GET` / `POST` | `/trips/{id}/incidents` | List or report incidents |
| `POST` | `/trips/{id}/incidents/{incidentId}/evidences` | Attach an evidence key |
| `POST` | `/trips/{id}/incidents/{incidentId}/resolve` | Resolve an incident |
| `GET` | `/iot-devices` | IoT devices loaned to the carrier |

## Routes

| Path under `/execution` | View | Access |
|:--|:--|:--|
| `trips` | `TripList` | Signed-in users |
| `trips/:id` | `TripDetail` | Signed-in users |
| `iot-devices` | `IotDeviceList` | Carriers only (`data.roles`) |

## Keeping the trip up to date

`TripDetail` reloads the trip, its track, its alerts and its history every 15 seconds while the trip is active and the
browser tab is visible (see ADR-014). While the carrier shares the location, `navigator.geolocation.watchPosition` sends
each position to the API; if the API answers with a deviation alert, the view adds it to the open alerts.

## Tests

| Spec | What it covers |
|:--|:--|
| `trip-status.value-object.spec.ts`, `trip.entity.spec.ts`, `deviation-alert.entity.spec.ts`, `incident.entity.spec.ts`, `report-incident.command.spec.ts` | Domain rules and validations |
| `execution.store.spec.ts` | Signals, upsert of trips and input validation |
| `execution-api.spec.ts` | Paths, verbs, bodies and the mapping of resources |
| `execution.routes.spec.ts` | Route table, role restriction and lazy loading |
| `trip-list.spec.ts`, `iot-device-list.spec.ts`, `incident-panel.spec.ts` | Rendering and behavior of the views |

Run them from the project root with `npm test`.
