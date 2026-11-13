import {ChangeDetectionStrategy, Component, effect, inject, signal, untracked} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {BreakpointObserver} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {MatSidenavModule} from '@angular/material/sidenav';
import {SideMenu} from '../side-menu/side-menu';
import {TopBar} from '../top-bar/top-bar';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import {FooterContent} from '../footer-content/footer-content';
import {IamStore} from '../../../../iam/application/iam.store';
import {ProfileStore} from '../../../../iam/application/profile.store';
import {MatchmakingStore} from '../../../../matchmaking/application/matchmaking.store';
import {ExecutionStore} from '../../../../execution/application/execution.store';
import {ReputationStore} from '../../../../reputation/application/reputation.store';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, MatSidenavModule, SideMenu, TopBar, LanguageSwitcher, FooterContent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Layout {
  static readonly DESKTOP_QUERY = '(min-width: 1024px)';

  protected readonly iamStore = inject(IamStore);
  private readonly profileStore = inject(ProfileStore);
  private readonly matchmakingStore = inject(MatchmakingStore);
  private readonly executionStore = inject(ExecutionStore);
  private readonly reputationStore = inject(ReputationStore);

  protected readonly isDesktop = toSignal(
    inject(BreakpointObserver).observe(Layout.DESKTOP_QUERY).pipe(map(state => state.matches)),
    { initialValue: false }
  );

  protected readonly drawerOpened = signal(false);

  constructor() {
    effect(() => {
      if (this.iamStore.isSignedIn()) untracked(() => this.loadContexts());
    });
  }

  protected toggleDrawer(): void {
    this.drawerOpened.update(opened => !opened);
  }

  protected closeDrawer(): void {
    if (!this.isDesktop()) this.drawerOpened.set(false);
  }

  private loadContexts(): void {
    this.profileStore.loadProfiles();
    this.matchmakingStore.loadAll();
    this.executionStore.loadShipments();
    this.reputationStore.loadRatings();
  }
}
