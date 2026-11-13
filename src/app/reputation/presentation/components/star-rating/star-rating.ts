import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {Score} from '../../../domain/model/score.value-object';

@Component({
  selector: 'app-star-rating',
  imports: [MatIcon, TranslatePipe],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarRating {
  readonly value = input<number>(0);
  readonly readonly = input<boolean>(false);
  readonly valueChange = output<number>();

  protected readonly stars = Array.from({ length: Score.MAX }, (_, index) => index + 1);

  protected select(star: number): void {
    if (!this.readonly()) this.valueChange.emit(star);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.readonly()) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.valueChange.emit(Math.min(Score.MAX, this.value() + 1));
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.valueChange.emit(Math.max(Score.MIN, this.value() - 1));
    }
  }
}
