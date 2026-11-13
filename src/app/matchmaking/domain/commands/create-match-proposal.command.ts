export class CreateMatchProposalCommand {
  readonly shipmentRequestId: string;
  readonly returnRouteId: string;
  readonly offeredRate: number;
  readonly currency: string;

  constructor(props: { shipmentRequestId: string | null; returnRouteId: string | null; offeredRate: number | null; currency?: string }) {
    if (!props.shipmentRequestId || !props.returnRouteId) throw new Error('validation.route-required');
    if (!(Number(props.offeredRate) > 0)) throw new Error('validation.rate-positive');
    this.shipmentRequestId = props.shipmentRequestId;
    this.returnRouteId = props.returnRouteId;
    this.offeredRate = Math.round(Number(props.offeredRate) * 100) / 100;
    this.currency = props.currency ?? 'PEN';
  }
}
