import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { FinanceService } from '../services/finance.service';

export const walletAccessGuard: CanActivateFn = () => {
  const financeService = inject(FinanceService);
  const router = inject(Router);

  if (financeService.hasWallets()) {
    return true;
  }

  return financeService.loadWallets().pipe(
    map(wallets => wallets.length > 0 ? true : router.createUrlTree(['/carteiras'])),
    catchError(() => of(router.createUrlTree(['/carteiras'])))
  );
};
