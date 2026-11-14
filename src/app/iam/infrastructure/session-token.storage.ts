import {Injectable, signal} from '@angular/core';
import {AccountResource, AuthenticatedSessionResource} from './iam-resources';

/**
 * Keeps the platform session (JWT access token, refresh token and account) in localStorage, with the same keys as
 * the Vue client, and exposes the account as a signal so the IAM store reacts to sign in, refresh and sign out.
 */
@Injectable({providedIn: 'root'})
export class SessionTokenStorage {
  static readonly KEYS = Object.freeze({
    accessToken: 'trazza.session.access-token',
    refreshToken: 'trazza.session.refresh-token',
    user: 'trazza.session.user',
    activeRole: 'trazza.session.active-role'
  });

  private readonly accountSignal = signal<AccountResource | null>(this.readAccount());

  readonly account = this.accountSignal.asReadonly();

  get accessToken(): string | null {
    return SessionTokenStorage.read(SessionTokenStorage.KEYS.accessToken);
  }

  get refreshToken(): string | null {
    return SessionTokenStorage.read(SessionTokenStorage.KEYS.refreshToken);
  }

  get activeRole(): string | null {
    return SessionTokenStorage.read(SessionTokenStorage.KEYS.activeRole);
  }

  set activeRole(role: string | null) {
    SessionTokenStorage.write(SessionTokenStorage.KEYS.activeRole, role);
  }

  save(session: AuthenticatedSessionResource): void {
    SessionTokenStorage.write(SessionTokenStorage.KEYS.accessToken, session.accessToken);
    SessionTokenStorage.write(SessionTokenStorage.KEYS.refreshToken, session.refreshToken);
    this.saveAccount(session.user);
  }

  saveAccount(account: AccountResource): void {
    SessionTokenStorage.write(SessionTokenStorage.KEYS.user, JSON.stringify(account));
    this.accountSignal.set(account);
  }

  clear(): void {
    Object.values(SessionTokenStorage.KEYS).forEach(key => SessionTokenStorage.write(key, null));
    this.accountSignal.set(null);
  }

  private readAccount(): AccountResource | null {
    if (!this.accessToken) return null;
    const raw = SessionTokenStorage.read(SessionTokenStorage.KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AccountResource;
    } catch {
      return null;
    }
  }

  private static read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private static write(key: string, value: string | null): void {
    try {
      if (value === null || value === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable (private mode); the session then lives only in memory.
    }
  }
}
