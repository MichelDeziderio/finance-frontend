import { Routes } from '@angular/router';
import { MovementsListComponent } from './features/movements/pages/movements-list/movements-list.component';
import { MovementFormComponent } from './features/movements/components/movement-form/movement-form.component';
import { CategoriesListComponent } from './features/categories/pages/categories-list/categories-list.component';
import { WalletsComponent } from './features/movements/pages/wallets/wallets.component';
import { DashboardComponent } from './features/movements/pages/dashboard/dashboard.component';
import { walletAccessGuard } from './core/guards/wallet-access.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AppShellComponent } from './layout/components/app-shell.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';

export const routes: Routes = [
  // Rotas Públicas de Autenticação
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'cadastro', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'esqueci-senha', component: ForgotPasswordComponent, canActivate: [guestGuard] },
  { path: 'redefinir-senha', component: ResetPasswordComponent },

  // Rotas Protegidas (dentro do Shell da aplicação)
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'carteiras' },
      { path: 'carteiras', component: WalletsComponent },
      { path: 'movimentacoes', component: MovementsListComponent, canActivate: [walletAccessGuard] },
      { path: 'movimentacoes/nova', component: MovementFormComponent, canActivate: [walletAccessGuard] },
      { path: 'movimentacoes/:id/editar', component: MovementFormComponent, canActivate: [walletAccessGuard] },
      { path: 'categorias', component: CategoriesListComponent, canActivate: [walletAccessGuard] },
      { path: 'dashboard', component: DashboardComponent, canActivate: [walletAccessGuard] },
    ],
  },

  { path: '**', redirectTo: 'carteiras' },
];
