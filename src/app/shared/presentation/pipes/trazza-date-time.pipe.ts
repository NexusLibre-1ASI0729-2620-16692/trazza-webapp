import {Pipe, PipeTransform} from '@angular/core';
import {formatDateTime} from '../formatters';

@Pipe({ name: 'trazzaDateTime' })
export class TrazzaDateTimePipe implements PipeTransform {
  transform(value: string | null | undefined, language?: string | null): string {
    return formatDateTime(value, language);
  }
}
