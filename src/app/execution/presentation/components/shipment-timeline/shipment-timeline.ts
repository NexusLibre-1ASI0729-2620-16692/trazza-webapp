import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';

import {DatePipe} from '@angular/common';

import {Shipment} from '../../../domain/model/shipment.entity';

@Component({
  selector: 'app-shipment-timeline',
  standalone: true,
  imports: [
    DatePipe
  ],
  templateUrl: './shipment-timeline.html',
  styleUrl: './shipment-timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShipmentTimeline {

  readonly shipment = input.required<Shipment>();

  get events() {
    return this.shipment().events;
  }

  objectKeys(value: Record<string, unknown>): string[] {
    return Object.keys(value);
  }

  objectEntries(
    value: Record<string, unknown>
  ): [string, unknown][] {
    return Object.entries(value);
  }

  getEventLabel(type: string): string {
    const labels: Record<string, string> = {
      matched: 'Carga asignada',
      picked_up: 'Carga recogida',
      location_updated: 'Ubicación actualizada',
      delivered: 'Carga entregada',
      closed: 'Envío cerrado',
      cancelled: 'Envío cancelado'
    };

    return labels[type] ?? type;
  }

  getEventIcon(type: string): string {
    const icons: Record<string, string> = {
      matched: 'handshake',
      picked_up: 'inventory_2',
      location_updated: 'location_on',
      delivered: 'check_circle',
      closed: 'task_alt',
      cancelled: 'cancel'
    };

    return icons[type] ?? 'circle';
  }
}
