import { Routes } from '@angular/router';
import { MovementsListComponent } from './features/movements/pages/movements-list/movements-list.component';
import { MovementFormComponent } from './features/movements/components/movement-form/movement-form.component';
import { CategoriesListComponent } from './features/categories/pages/categories-list/categories-list.component';
import { WalletsComponent } from './features/movements/pages/wallets/wallets.component';
import { walletAccessGuard } from './core/guards/wallet-access.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'carteiras' },
  { path: 'carteiras', component: WalletsComponent },
  { path: 'movimentacoes', component: MovementsListComponent, canActivate: [walletAccessGuard] },
  { path: 'movimentacoes/nova', component: MovementFormComponent, canActivate: [walletAccessGuard] },
  { path: 'movimentacoes/:id/editar', component: MovementFormComponent, canActivate: [walletAccessGuard] },
  { path: 'categorias', component: CategoriesListComponent, canActivate: [walletAccessGuard] },
  { path: '**', redirectTo: 'carteiras' }
];
