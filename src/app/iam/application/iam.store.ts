import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../domain/model/user.entity';
import { Phone } from '../domain/model/phone.value-object';
import { SignInCommand } from '../domain/commands/sign-in.command';
import { SignUpCommand } from '../domain/commands/sign-up.command';
import { IamApi } from '../infrastructure/iam-api.service';
import { UserAssembler } from '../infrastructure/user-assembler';
import { SESSION_TOKEN_KEY } from '../infrastructure/iam.interceptor';

const SESSION_USER_KEY = 'trazza.session.user';

@Injectable({ providedIn: 'root' })
export class IamStore {
  private readonly iamApi = inject(IamApi);

  // State
  private readonly _currentUser = signal<User | null>(null);
  private readonly _processing = signal<boolean>(false);
  private readonly _errors = signal<Error[]>([]);

  // Selectors
  readonly currentUser = this._currentUser.asReadonly();
  readonly processing = this._processing.asReadonly();
  readonly errors = this._errors.asReadonly();

  readonly isSignedIn = computed(() => this._currentUser() !== null);
  readonly currentRole = computed(() => this._currentUser()?.role.value ?? null);
  readonly currentUserId = computed(() => this._currentUser()?.id ?? null);
  readonly isCarrier = computed(() => this.currentRole() === 'carrier');
  readonly isMerchant = computed(() => this.currentRole() === 'merchant');

  constructor() {
    this.restoreSession();
  }

  private startSession(user: User): void {
    this._currentUser.set(user);
    localStorage.setItem(SESSION_TOKEN_KEY, btoa(`${user.id}:${user.email.value}:${Date.now()}`));
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(UserAssembler.toResourceFromEntity(user)));
  }

  private restoreSession(): void {
    const serializedUser = localStorage.getItem(SESSION_USER_KEY);
    if (!serializedUser || !localStorage.getItem(SESSION_TOKEN_KEY)) return;
    try {
      this._currentUser.set(UserAssembler.toEntityFromResource(JSON.parse(serializedUser)));
    } catch (error) {
      this.signOut();
    }
  }

  async signIn(command: SignInCommand): Promise<User> {
    this._processing.set(true);
    try {
      const response = await firstValueFrom(this.iamApi.signIn(command));
      const users = UserAssembler.toEntitiesFromResources(response);
      if (users.length !== 1) throw new Error('validation.invalid-credentials');
      
      this.startSession(users[0]);
      this._errors.set([]);
      return users[0];
    } catch (error: any) {
      this._errors.update(errs => [...errs, error]);
      throw error;
    } finally {
      this._processing.set(false);
    }
  }

  async signUp(command: SignUpCommand): Promise<User> {
    this._processing.set(true);
    try {
      const existing = await firstValueFrom(this.iamApi.findUsersByEmail(command.email));
      if (existing.length > 0) throw new Error('validation.email-already-registered');
      
      const response = await firstValueFrom(this.iamApi.signUp(command));
      const user = UserAssembler.toEntityFromResource(response);
      
      // Note: profile creation will be coordinated by a facade or component.
      
      this.startSession(user);
      this._errors.set([]);
      return user;
    } catch (error: any) {
      this._errors.update(errs => [...errs, error]);
      throw error;
    } finally {
      this._processing.set(false);
    }
  }

  async updateCurrentUser(data: { fullName: string; phone: string }): Promise<void> {
    const user = this._currentUser();
    if (!user || !user.id) return;

    user.updateContact(data.fullName, new Phone(data.phone));
    const resource = UserAssembler.toResourceFromEntity(user);
    
    await firstValueFrom(this.iamApi.updateUser(user.id, resource));
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(resource));
    this._currentUser.set(UserAssembler.toEntityFromResource(resource)); // trigger reactivity
  }

  signOut(): void {
    this._currentUser.set(null);
    this._errors.set([]);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  }
}
