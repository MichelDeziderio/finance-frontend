import { Routes } from '@angular/router';
import { MovementFormComponent } from './features/movements/components/movement-form/movement-form.component';
import { CategoriesListComponent } from './features/categories/pages/categories-list/categories-list.component';
import { WalletsComponent } from './features/movements/pages/wallets/wallets.component';
import { walletAccessGuard } from './core/guards/wallet-access.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'carteiras' },
  { path: 'carteiras', component: WalletsComponent },
  { path: 'movimentacoes', pathMatch: 'full', redirectTo: 'movimentacoes/nova' },
  { path: 'movimentacoes/nova', component: MovementFormComponent, canActivate: [walletAccessGuard] },
  { path: 'categorias', component: CategoriesListComponent, canActivate: [walletAccessGuard] },
  { path: '**', redirectTo: 'carteiras' }
];
