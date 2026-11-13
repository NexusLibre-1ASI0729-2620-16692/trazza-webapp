import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { IamStore } from '../../../application/iam.store';
import { SignInCommand } from '../../../domain/commands/sign-in.command';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    NgIf
  ],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  public readonly iamStore = inject(IamStore);

  signInForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  hidePassword = signal(true);
  errorMessage = signal<string | null>(null);

  async onSubmit() {
    if (this.signInForm.invalid) return;

    this.errorMessage.set(null);
    const command: SignInCommand = this.signInForm.value;

    try {
      await this.iamStore.signIn(command);
      this.router.navigate(['/']); // Redirect to dashboard or home
    } catch (error: any) {
      // Basic error handling mapping; a real app uses a centralized error handler
      this.errorMessage.set(error.message || 'Invalid credentials');
    }
  }

  togglePasswordVisibility(event: MouseEvent) {
    this.hidePassword.set(!this.hidePassword());
    event.stopPropagation();
  }
}
