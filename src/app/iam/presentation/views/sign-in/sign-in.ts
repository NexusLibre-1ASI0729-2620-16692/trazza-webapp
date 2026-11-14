import {ChangeDetectionStrategy, Component, inject, input, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {SignInCommand} from '../../../domain/commands/sign-in.command';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInput, MatButton, MatIconButton, MatIcon, TranslatePipe],
  templateUrl: './sign-in.html',
  styles: `.auth-card { width: 100%; max-width: 26rem; } .center { text-align: center; }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignIn {
  /** Where to go after signing in (query parameter set by the guard). */
  readonly redirect = input<string>('');

  protected readonly store = inject(IamStore);
  private readonly feedback = inject(FeedbackService);
  private readonly router = inject(Router);

  protected readonly showPassword = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({ email: [''], password: [''] });

  protected async submit(): Promise<void> {
    const signedIn = await this.feedback.attempt(() => this.store.signIn(new SignInCommand(this.form.getRawValue())));
    if (signedIn) await this.router.navigateByUrl(this.redirect() || '/dashboard');
  }
}
