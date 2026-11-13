import {ChangeDetectionStrategy, Component, input, model} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

/** One to five stars. Read only by default; with readonly=false the user picks a value. */
@Component({
  selector: 'app-star-rating',
  imports: [MatIcon],
  template: `
    <span class="stars" [class.editable]="!readonly()" role="radiogroup" [attr.aria-label]="label()">
      @for (star of stars; track star) {
        @if (readonly()) {
          <mat-icon class="star" [class.filled]="star <= value()" aria-hidden="true">{{ star <= value() ? 'star' : 'star_border' }}</mat-icon>
        } @else {
          <button type="button" class="star-button" role="radio" [attr.aria-checked]="star === value()"
                  [attr.aria-label]="star + ' / 5'" (click)="value.set(star)">
            <mat-icon class="star" [class.filled]="star <= value()">{{ star <= value() ? 'star' : 'star_border' }}</mat-icon>
          </button>
        }
      }
    </span>
  `,
  styles: `
    .stars { display: inline-flex; align-items: center; gap: 0.1rem; vertical-align: middle; }
    .star { color: #c3c6d7; font-size: 1.25rem; width: 1.25rem; height: 1.25rem; }
    .star.filled { color: #f59e0b; }
    .editable .star { font-size: 1.75rem; width: 1.75rem; height: 1.75rem; }
    .star-button { background: transparent; border: none; padding: 0; cursor: pointer; line-height: 0; }
    .star-button:focus-visible { outline: 2px solid var(--trazza-accent); border-radius: 4px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarRating {
  readonly value = model<number>(0);
  readonly readonly = input<boolean>(true);
  readonly label = input<string>('');
  protected readonly stars = [1, 2, 3, 4, 5];
}
