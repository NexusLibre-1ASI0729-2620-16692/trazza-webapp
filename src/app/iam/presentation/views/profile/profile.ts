import {ChangeDetectionStrategy, Component, effect, inject, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {Phone} from '../../../domain/model/phone.value-object';
import {UserRole} from '../../../domain/model/user-role.value-object';
import {SignUpCommand} from '../../../domain/commands/sign-up.command';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {StatusTag} from '../../../../shared/presentation/components/status-tag/status-tag';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInput, MatButton, MatIcon, TranslatePipe, StatusTag, TrazzaDateTimePipe],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Profile implements OnInit {
  protected readonly store = inject(IamStore);
  protected readonly locale = inject(LocaleService);
  private readonly feedback = inject(FeedbackService);
  private readonly formBuilder = inject(FormBuilder).nonNullable;

  protected readonly user = this.store.currentUser;
  protected readonly identityForm = this.formBuilder.group({ fullName: [''], phone: [''] });
  protected readonly businessForm = this.formBuilder.group({ businessName: [''], businessType: [''] });
  protected readonly newMerchantForm = this.formBuilder.group({ businessName: [''], ruc: [''], businessType: [''] });

  constructor() {
    effect(() => {
      const user = this.user();
      this.identityForm.setValue({ fullName: user?.fullName ?? '', phone: user?.phone ?? '' });
      this.businessForm.setValue({
        businessName: user?.merchantProfile?.businessName ?? '',
        businessType: user?.merchantProfile?.businessType ?? ''
      });
    });
  }

  ngOnInit(): void {
    Promise.all([this.store.refreshAccount(), this.store.loadVerifications()]).catch(error => this.feedback.showError(error));
  }

  protected saveIdentity(): void {
    const { fullName, phone } = this.identityForm.getRawValue();
    this.feedback.attempt(() => this.store.updateIdentity(fullName.trim(), new Phone(phone).value), 'profile.identity-saved').then();
  }

  protected saveBusiness(): void {
    const { businessName, businessType } = this.businessForm.getRawValue();
    this.feedback.attempt(() => this.store.updateMerchantProfile(businessName.trim(), businessType.trim()), 'profile.business-saved').then();
  }

  protected addCarrierRole(): void {
    this.feedback.attempt(() => this.store.addRole(UserRole.CARRIER), 'profile.role-added').then();
  }

  protected addMerchantRole(): void {
    this.feedback.attempt(
      () => this.store.addRole(UserRole.MERCHANT, SignUpCommand.merchantData(this.newMerchantForm.getRawValue())),
      'profile.role-added'
    ).then();
  }

  protected verify(): void {
    this.feedback.attempt(() => this.store.submitVerification(), 'profile.verification-sent').then();
  }
}
