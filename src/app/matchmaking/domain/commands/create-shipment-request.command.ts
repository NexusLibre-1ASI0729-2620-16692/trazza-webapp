import {Place} from '../../../shared/domain/model/place.value-object';
import {CreateReturnRouteCommand} from './create-return-route.command';

export class CreateShipmentRequestCommand {
  readonly description: string;
  readonly weightKg: number;
  readonly volumeM3: number;
  readonly pickup: Place;
  readonly delivery: Place;
  readonly pickupFrom: string;
  readonly pickupUntil: string;

  constructor(props: {
    description: string; weightKg: number | null; volumeM3: number | null; pickup: Place; delivery: Place;
    pickupFrom: Date | null; pickupUntil: Date | null;
  }) {
    const text = (props.description ?? '').trim();
    if (!text) throw new Error('validation.description-required');
    if (!(Number(props.weightKg) > 0)) throw new Error('validation.weight-positive');
    if (!(Number(props.volumeM3) > 0)) throw new Error('validation.volume-positive');
    const from = props.pickupFrom;
    const until = props.pickupUntil;
    if (!from || !until || Number.isNaN(from.getTime()) || Number.isNaN(until.getTime()) || until <= from)
      throw new Error('validation.pickup-window');
    if (until <= new Date()) throw new Error('validation.pickup-window-past');
    this.description = text;
    this.weightKg = Number(props.weightKg);
    this.volumeM3 = Number(props.volumeM3);
    this.pickup = CreateReturnRouteCommand.place(props.pickup);
    this.delivery = CreateReturnRouteCommand.place(props.delivery);
    this.pickupFrom = from.toISOString();
    this.pickupUntil = until.toISOString();
  }
}
