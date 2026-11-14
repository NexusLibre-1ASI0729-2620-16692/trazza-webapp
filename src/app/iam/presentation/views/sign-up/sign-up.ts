import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {SignUpCommand} from '../../../domain/commands/sign-up.command';
import {ALL_ROLES, UserRole} from '../../../domain/model/user-role.value-object';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInput, MatButton, MatCheckbox, TranslatePipe],
  templateUrl: './sign-up.html',
  styles: `
    .auth-card { width: 100%; max-width: 38rem; }
    .center { text-align: center; }
    .roles { border: none; padding: 0; margin-left: 0; margin-right: 0; }
    .full-row { grid-column: 1 / -1; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUp {
  protected readonly store = inject(IamStore);
  private readonly feedback = inject(FeedbackService);
  private readonly router = inject(Router);

  protected readonly allRoles = ALL_ROLES;
  protected readonly roles = signal<UserRole[]>([UserRole.CARRIER]);
  protected readonly needsBusiness = computed(() => this.roles().includes(UserRole.MERCHANT));
  protected readonly form = inject(FormBuilder).nonNullable.group({
    fullName: [''], dni: [''], phone: [''], email: [''], password: [''], businessName: [''], ruc: [''], businessType: ['']
  });

  protected toggleRole(role: UserRole, checked: boolean): void {
    this.roles.update(roles => checked ? [...new Set([...roles, role])] : roles.filter(item => item !== role));
  }

  protected async submit(): Promise<void> {
    const signedUp = await this.feedback.attempt(() => this.store.signUp(new SignUpCommand({ ...this.form.getRawValue(), roles: this.roles() })));
    if (signedUp) await this.router.navigate(['/dashboard']);
  }
}
