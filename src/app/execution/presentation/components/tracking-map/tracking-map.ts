import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';

import {DecimalPipe} from '@angular/common';

import {GeoLocation} from '../../../../shared/domain/model/geo-location.value-object';

@Component({
  selector: 'app-tracking-map',
  standalone: true,
  imports: [
    DecimalPipe
  ],
  templateUrl: './tracking-map.html',
  styleUrl: './tracking-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackingMap {

  readonly currentLocation = input<GeoLocation | null>(null);
  readonly deliveryLocation = input<GeoLocation | null>(null);
  readonly isOffRoute = input(false);
  readonly deviationKm = input(0);

}
