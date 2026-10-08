import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIf, NgClass } from '@angular/common';
import { IamStore } from '../../../application/iam.store';
import { ProfileStore } from '../../../application/profile.store';
import { SignUpCommand } from '../../../domain/commands/sign-up.command';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    TranslatePipe,
    NgIf,
    NgClass
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  public readonly iamStore = inject(IamStore);
  public readonly profileStore = inject(ProfileStore);

  signUpForm: FormGroup = this.fb.group({
    role: ['carrier'],
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    businessName: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^9\\d{8}$')]],
    documentNumber: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    acceptedTerms: [false, Validators.requiredTrue]
  }, { validators: passwordMatchValidator });

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['role'] === 'merchant') {
        this.signUpForm.patchValue({ role: 'merchant' });
      }
    });

    this.signUpForm.get('role')?.valueChanges.subscribe(role => {
      const businessNameCtrl = this.signUpForm.get('businessName');
      const docCtrl = this.signUpForm.get('documentNumber');
      
      businessNameCtrl?.clearValidators();
      docCtrl?.clearValidators();

      if (role === 'merchant') {
        businessNameCtrl?.setValidators([Validators.required]);
        docCtrl?.setValidators([Validators.required, Validators.pattern('^(10|20)\\d{9}$')]);
      } else {
        docCtrl?.setValidators([Validators.required, Validators.pattern('^\\d{8}$')]);
      }
      
      businessNameCtrl?.updateValueAndValidity();
      docCtrl?.updateValueAndValidity();
    });
  }

  get isMerchant(): boolean {
    return this.signUpForm.get('role')?.value === 'merchant';
  }

  async onSubmit() {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const formValue = this.signUpForm.value;
    
    const command: SignUpCommand = {
      role: formValue.role,
      email: formValue.email,
      password: formValue.password,
      fullName: formValue.fullName,
      phone: formValue.phone,
      companyName: formValue.role === 'merchant' ? formValue.businessName : undefined,
      ruc: formValue.role === 'merchant' ? formValue.documentNumber : undefined,
      dni: formValue.role === 'carrier' ? formValue.documentNumber : undefined
    };

    try {
      const user = await this.iamStore.signUp(command);
      await this.profileStore.createProfileForUser(user, command);
      this.router.navigate(['/dashboard']); // Redirect to dashboard
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Error during sign up');
    }
  }
}
