import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, effect, input, model, OnDestroy, signal, viewChild
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import * as L from 'leaflet';
import {Place} from '../../../domain/model/place.value-object';

export interface SavedPlace {
  id: string | number;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
}

/** Address input plus a Leaflet map. A click on the map, a saved address or the device location sets the point. */
@Component({
  selector: 'app-map-picker',
  imports: [FormsModule, MatFormFieldModule, MatInput, MatSelectModule, MatIconButton, MatIcon, MatTooltip, TranslatePipe],
  template: `
    <div class="stack">
      <div class="row wrap picker-row">
        <mat-form-field appearance="outline" class="picker-address">
          <mat-label>{{ label() }}</mat-label>
          <input matInput [id]="inputId()" [ngModel]="value().address" (ngModelChange)="update({ address: $event })"
                 [placeholder]="'map.address-placeholder' | translate" autocomplete="off">
        </mat-form-field>
        @if (savedAddresses().length) {
          <mat-form-field appearance="outline" class="picker-saved">
            <mat-label>{{ 'map.saved-addresses' | translate }}</mat-label>
            <mat-select (selectionChange)="useSaved($event.value)">
              @for (saved of savedAddresses(); track saved.id) {
                <mat-option [value]="saved">{{ saved.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
        <button mat-icon-button type="button" [matTooltip]="'map.my-location' | translate"
                [attr.aria-label]="'map.my-location' | translate" (click)="useMyLocation()">
          <mat-icon>my_location</mat-icon>
        </button>
      </div>
      <div #mapElement class="map-picker"></div>
      <small class="trazza-muted text-sm">
        @if (value().latitude !== null) {
          {{ 'map.selected-point' | translate: { latitude: value().latitude!, longitude: value().longitude! } }}
        } @else {
          {{ 'map.click-hint' | translate }}
        }
      </small>
      @if (locationError()) {
        <small class="text-sm tag-danger">{{ locationError() | translate }}</small>
      }
    </div>
  `,
  styles: `
    .picker-row { align-items: flex-start; gap: 0.5rem; }
    .picker-address { flex: 1 1 16rem; }
    .picker-saved { flex: 0 1 14rem; }
    .map-picker { height: 16rem; border-radius: 8px; border: 1px solid var(--trazza-line); z-index: 0; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapPicker implements AfterViewInit, OnDestroy {
  static readonly LIMA: L.LatLngTuple = [-12.0464, -77.0428];

  readonly value = model.required<Place>();
  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly savedAddresses = input<SavedPlace[]>([]);

  protected readonly locationError = signal('');
  private readonly mapElement = viewChild.required<ElementRef<HTMLDivElement>>('mapElement');
  private map: L.Map | null = null;
  private marker: L.CircleMarker | null = null;

  constructor() {
    effect(() => {
      const { latitude, longitude } = this.value();
      this.placeMarker(latitude, longitude);
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapElement().nativeElement).setView(MapPicker.LIMA, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(this.map);
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.update({ latitude: Number(event.latlng.lat.toFixed(6)), longitude: Number(event.latlng.lng.toFixed(6)) });
    });
    const { latitude, longitude } = this.value();
    this.placeMarker(latitude, longitude, latitude !== null);
    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  protected update(patch: Partial<Place>): void {
    this.value.update(current => ({ ...current, ...patch }));
  }

  protected useSaved(saved: SavedPlace): void {
    this.update({ address: saved.address, latitude: saved.latitude, longitude: saved.longitude });
    this.placeMarker(saved.latitude, saved.longitude, true);
  }

  protected useMyLocation(): void {
    if (!navigator.geolocation) {
      this.locationError.set('errors.geolocation-unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      this.locationError.set('');
      const latitude = Number(position.coords.latitude.toFixed(6));
      const longitude = Number(position.coords.longitude.toFixed(6));
      this.update({ latitude, longitude });
      this.placeMarker(latitude, longitude, true);
    }, () => this.locationError.set('errors.geolocation-denied'));
  }

  private placeMarker(latitude: number | null, longitude: number | null, pan = false): void {
    if (!this.map || latitude === null || longitude === null) return;
    if (!this.marker) this.marker = L.circleMarker([latitude, longitude], { radius: 9, color: '#0037b0', fillOpacity: 0.8 }).addTo(this.map);
    else this.marker.setLatLng([latitude, longitude]);
    if (pan) this.map.setView([latitude, longitude], Math.max(this.map.getZoom(), 14), { animate: false });
  }
}
