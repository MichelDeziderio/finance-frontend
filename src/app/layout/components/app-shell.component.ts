import { Component, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FinanceService } from '../../core/services/finance.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, ButtonModule, SelectModule],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  readonly financeService = inject(FinanceService);
  private readonly router = inject(Router);
  isShow = false;
  readonly hasWallets = this.financeService.hasWallets;
  readonly hasNoWallets = computed(() => this.financeService.walletsLoaded() && !this.hasWallets());

  readonly walletOptions = computed(() => this.financeService.wallets().map(wallet => ({
    label: wallet.name,
    value: wallet.id
  })));

  constructor() {
    effect(() => {
      if (!this.hasNoWallets() || this.router.url.startsWith('/carteiras')) {
        return;
      }

      this.closeMenu();
      void this.router.navigate(['/carteiras']);
    });
  }

  toggleMenu(): void { this.isShow = !this.isShow; }
  closeMenu(): void { this.isShow = false; }

  isMenuItemDisabled(path: string): boolean {
    return path !== '/carteiras' && this.hasNoWallets();
  }

  getMenuLink(path: string): string | null {
    return this.isMenuItemDisabled(path) ? null : path;
  }

  handleMenuItemClick(event: Event, path: string): void {
    if (this.isMenuItemDisabled(path)) {
      event.preventDefault();
      return;
    }

    this.closeMenu();
  }

  selectWallet(walletId: string): void {
    this.financeService.setActiveWallet(walletId);
  }
}
