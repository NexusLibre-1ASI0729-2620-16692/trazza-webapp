import {Pipe, PipeTransform} from '@angular/core';
import {formatMoney} from '../formatters';

@Pipe({ name: 'trazzaMoney' })
export class TrazzaMoneyPipe implements PipeTransform {
  transform(amount: number | null | undefined, currency?: string | null): string {
    return formatMoney(amount, currency ?? 'PEN');
  }
}
