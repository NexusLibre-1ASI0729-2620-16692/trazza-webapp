import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, effect, input, OnDestroy, viewChild} from '@angular/core';
import * as L from 'leaflet';

export interface MapStop {
  label: string;
  latitude: number | null;
  longitude: number | null;
  color?: string;
}

export interface MapPoint {
  latitude: number;
  longitude: number;
}

/** Read only map of a route: labelled stops joined by a dashed line, the GPS track in green and alerts in red. */
@Component({
  selector: 'app-route-map',
  template: `<div #mapElement class="route-map" [style.height]="height()"></div>`,
  styles: `
    .route-map { border-radius: 8px; border: 1px solid var(--trazza-line); z-index: 0; }
    :host ::ng-deep .route-map-stop span {
      display: inline-block; padding: 2px 8px; border-radius: 999px; color: #fff; font-size: 12px; font-weight: 600;
      white-space: nowrap; box-shadow: 0 1px 3px rgba(0, 0, 0, .3);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteMap implements AfterViewInit, OnDestroy {
  readonly stops = input<MapStop[]>([]);
  readonly track = input<MapPoint[]>([]);
  readonly alerts = input<MapPoint[]>([]);
  readonly height = input<string>('22rem');

  private readonly mapElement = viewChild.required<ElementRef<HTMLDivElement>>('mapElement');
  private map: L.Map | null = null;
  private layer: L.LayerGroup | null = null;
  private fitted = false;

  constructor() {
    effect(() => this.draw(this.stops(), this.track(), this.alerts()));
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapElement().nativeElement).setView([-12.0464, -77.0428], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(this.map);
    this.layer = L.layerGroup().addTo(this.map);
    this.draw(this.stops(), this.track(), this.alerts());
    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private draw(stops: MapStop[], track: MapPoint[], alerts: MapPoint[]): void {
    if (!this.map || !this.layer) return;
    this.layer.clearLayers();
    const bounds: L.LatLngTuple[] = [];
    const located = stops.filter(stop => stop.latitude !== null && stop.longitude !== null);
    const stopPoints = located.map(stop => [stop.latitude!, stop.longitude!] as L.LatLngTuple);
    if (stopPoints.length > 1) L.polyline(stopPoints, { color: '#5b7ad6', dashArray: '6 6', weight: 3 }).addTo(this.layer);
    located.forEach(stop => {
      const icon = L.divIcon({
        className: 'route-map-stop',
        html: `<span style="background:${stop.color ?? '#0037b0'}">${stop.label}</span>`,
        iconSize: undefined
      });
      L.marker([stop.latitude!, stop.longitude!], { icon }).addTo(this.layer!);
      bounds.push([stop.latitude!, stop.longitude!]);
    });
    const trackPoints = track.map(point => [point.latitude, point.longitude] as L.LatLngTuple);
    if (trackPoints.length) {
      L.polyline(trackPoints, { color: '#16a34a', weight: 4 }).addTo(this.layer);
      L.circleMarker(trackPoints[trackPoints.length - 1], { radius: 8, color: '#16a34a', fillOpacity: 1 }).addTo(this.layer);
      bounds.push(...trackPoints);
    }
    alerts.forEach(alert => L.circleMarker([alert.latitude, alert.longitude], { radius: 7, color: '#dc2626', fillOpacity: 0.7 }).addTo(this.layer!));
    if (bounds.length && !this.fitted) {
      this.map.fitBounds(L.latLngBounds(bounds).pad(0.2), { animate: false });
      this.fitted = true;
    }
  }
}
