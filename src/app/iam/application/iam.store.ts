import {computed, inject, Injectable, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {IamApi} from '../infrastructure/iam-api';
import {SessionTokenStorage} from '../infrastructure/session-token.storage';
import {UserAssembler} from '../infrastructure/user.assembler';
import {User} from '../domain/model/user.entity';
import {UserRole} from '../domain/model/user-role.value-object';
import {IdentityVerification} from '../domain/model/identity-verification.entity';
import {SignInCommand} from '../domain/commands/sign-in.command';
import {MerchantData, SignUpCommand} from '../domain/commands/sign-up.command';

/**
 * Session and account of the signed in user. A user can hold both roles; the active role decides which menu,
 * dashboard and screens the app shows.
 */
@Injectable({providedIn: 'root'})
export class IamStore {
  private readonly iamApi = inject(IamApi);
  private readonly storage = inject(SessionTokenStorage);

  private readonly selectedRole = signal<string | null>(this.storage.activeRole);
  private readonly verificationsSignal = signal<IdentityVerification[]>([]);
  private readonly processingSignal = signal(false);

  readonly currentUser = computed<User | null>(() => {
    const account = this.storage.account();
    return account ? UserAssembler.toEntityFromResource(account) : null;
  });
  readonly isSignedIn = computed(() => this.currentUser() !== null);
  readonly roles = computed<UserRole[]>(() => this.currentUser()?.roles ?? []);
  readonly activeRole = computed<UserRole | null>(() => {
    const user = this.currentUser();
    if (!user) return null;
    const selected = this.selectedRole();
    return user.hasRole(selected) ? selected as UserRole : user.roles[0] ?? null;
  });
  readonly isCarrier = computed(() => this.activeRole() === UserRole.CARRIER);
  readonly isMerchant = computed(() => this.activeRole() === UserRole.MERCHANT);
  readonly verifications = this.verificationsSignal.asReadonly();
  readonly processing = this.processingSignal.asReadonly();

  async signIn(command: SignInCommand): Promise<User | null> {
    return this.run(async () => {
      this.storage.save(await firstValueFrom(this.iamApi.signIn(command)));
      return this.currentUser();
    });
  }

  async signUp(command: SignUpCommand): Promise<User | null> {
    return this.run(async () => {
      this.storage.save(await firstValueFrom(this.iamApi.signUp(command)));
      this.switchRole(command.roles[0]);
      return this.currentUser();
    });
  }

  async signOut(): Promise<void> {
    const refreshToken = this.storage.refreshToken;
    try {
      if (refreshToken) await firstValueFrom(this.iamApi.signOut(refreshToken));
    } catch {
      // The local session is cleared anyway.
    }
    this.storage.clear();
    this.selectedRole.set(null);
    this.verificationsSignal.set([]);
  }

  async refreshAccount(): Promise<void> {
    this.storage.saveAccount(await firstValueFrom(this.iamApi.getMe()));
  }

  switchRole(role: UserRole): void {
    if (!this.currentUser()?.hasRole(role)) return;
    this.selectedRole.set(role);
    this.storage.activeRole = role;
  }

  async updateIdentity(fullName: string, phone: string): Promise<void> {
    await this.run(async () => this.storage.saveAccount(await firstValueFrom(this.iamApi.updateIdentity(fullName, phone))));
  }

  async addRole(role: UserRole, merchant: MerchantData | null = null): Promise<void> {
    await this.run(async () => {
      this.storage.saveAccount(await firstValueFrom(this.iamApi.addRole(role, merchant)));
      this.switchRole(role);
    });
  }

  async updateMerchantProfile(businessName: string, businessType: string): Promise<void> {
    await this.run(async () => this.storage.saveAccount(await firstValueFrom(this.iamApi.updateMerchantProfile(businessName, businessType))));
  }

  async loadVerifications(): Promise<void> {
    this.verificationsSignal.set(await firstValueFrom(this.iamApi.listIdentityVerifications()));
  }

  /** Sends the identity to the (simulated) KYC provider and reloads the account to read the new status. */
  async submitVerification(documentFrontS3Key: string | null = null, documentBackS3Key: string | null = null): Promise<void> {
    await this.run(async () => {
      await firstValueFrom(this.iamApi.submitIdentityVerification(documentFrontS3Key, documentBackS3Key));
      await Promise.all([this.loadVerifications(), this.refreshAccount()]);
    });
  }

  private async run<T>(action: () => Promise<T>): Promise<T> {
    this.processingSignal.set(true);
    try {
      return await action();
    } finally {
      this.processingSignal.set(false);
    }
  }
}
