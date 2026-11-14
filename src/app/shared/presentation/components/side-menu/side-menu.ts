import {ChangeDetectionStrategy, Component, computed, inject, output} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../../iam/application/iam.store';

export interface MenuOption {
  link: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-side-menu',
  imports: [RouterLink, RouterLinkActive, MatIcon, TranslatePipe],
  templateUrl: './side-menu.html',
  styleUrl: './side-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenu {
  static readonly CARRIER_OPTIONS: readonly MenuOption[] = Object.freeze([
    { link: '/dashboard', label: 'option.dashboard', icon: 'home' },
    { link: '/matchmaking/return-routes', label: 'option.return-routes', icon: 'alt_route' },
    { link: '/matchmaking/load-suggestions', label: 'option.load-suggestions', icon: 'inventory_2' },
    { link: '/matchmaking/offers', label: 'option.offers', icon: 'forum' },
    { link: '/execution/active-trip', label: 'option.active-trip', icon: 'local_shipping' },
    { link: '/execution/trip-history', label: 'option.trip-history', icon: 'history' },
    { link: '/iam/vehicles', label: 'option.vehicles', icon: 'directions_car' },
    { link: '/reputation/ratings', label: 'option.ratings', icon: 'star' },
    { link: '/reputation/points', label: 'option.points', icon: 'redeem' },
    { link: '/billing/plans', label: 'option.plans', icon: 'credit_card' },
    { link: '/billing/subscriptions', label: 'option.subscriptions', icon: 'event_repeat' },
    { link: '/billing/settlements', label: 'option.settlements', icon: 'account_balance_wallet' },
    { link: '/iam/profile', label: 'option.profile', icon: 'person' }
  ]);

  static readonly MERCHANT_OPTIONS: readonly MenuOption[] = Object.freeze([
    { link: '/dashboard', label: 'option.dashboard', icon: 'home' },
    { link: '/matchmaking/freight-requests', label: 'option.freight-requests', icon: 'inventory_2' },
    { link: '/matchmaking/find-carriers', label: 'option.find-carriers', icon: 'search' },
    { link: '/matchmaking/offers', label: 'option.offers', icon: 'forum' },
    { link: '/execution/shipment-tracking', label: 'option.shipment-tracking', icon: 'location_on' },
    { link: '/execution/shipment-history', label: 'option.shipment-history', icon: 'history' },
    { link: '/reputation/ratings', label: 'option.ratings', icon: 'star' },
    { link: '/reputation/points', label: 'option.points', icon: 'redeem' },
    { link: '/billing/settlements', label: 'option.settlements', icon: 'account_balance_wallet' },
    { link: '/iam/profile', label: 'option.profile', icon: 'person' }
  ]);

  readonly navigate = output<void>();

  private readonly iamStore = inject(IamStore);
  private readonly router = inject(Router);

  protected readonly options = computed(() => this.iamStore.isCarrier() ? SideMenu.CARRIER_OPTIONS : SideMenu.MERCHANT_OPTIONS);

  protected readonly accountLabel = computed(() => this.iamStore.isCarrier() ? 'menu.carrier-account' : 'menu.merchant-account');

  protected signOut(): void {
    this.iamStore.signOut();
    this.navigate.emit();
    this.router.navigate(['/iam/sign-in']).then();
  }
}
