import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import {
  Category,
  CategoryPayload,
  DashboardResponse,
  Movement,
  MovementFilters,
  MovementPayload,
  MovementType,
  PaginatedResponse,
  Wallet,
  WalletPayload
} from '../../models/finance.models';
import { environment } from '../../../environments/environment';

const ACTIVE_WALLET_KEY = 'finance.active-wallet-id';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly _wallets = signal<Wallet[]>([]);
  private readonly _walletsLoaded = signal(false);
  private readonly _categories = signal<Category[]>([]);
  private readonly _movements = signal<Movement[]>([]);
  private readonly _activeWalletId = signal<string | null>(sessionStorage.getItem(ACTIVE_WALLET_KEY));
  private readonly _movementMeta = signal<PaginatedResponse<Movement>['meta']>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  private walletsRequest$: Observable<Wallet[]> | null = null;

  readonly wallets = this._wallets.asReadonly();
  readonly walletsLoaded = this._walletsLoaded.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly movements = this._movements.asReadonly();
  readonly activeWalletId = this._activeWalletId.asReadonly();
  readonly movementMeta = this._movementMeta.asReadonly();
  readonly hasWallets = computed(() => this._wallets().length > 0);
  readonly activeWallet = computed(() => this._wallets().find(wallet => wallet.id === this._activeWalletId()) ?? null);
  readonly incomeCategories = computed(() => this._categories().filter(category => category.type === 'income'));
  readonly expenseCategories = computed(() => this._categories().filter(category => category.type === 'expense'));

  constructor() {
    this.loadWallets().subscribe();
  }

  loadWallets(force = false): Observable<Wallet[]> {
    if (!force) {
      if (this._walletsLoaded()) return of(this._wallets());
      if (this.walletsRequest$) return this.walletsRequest$;
    }

    const request$ = this.http.get<Wallet[]>(`${this.apiUrl}/wallets`).pipe(
      tap(wallets => {
        this._wallets.set(wallets);
        this._walletsLoaded.set(true);
        const savedId = this._activeWalletId();
        const activeId = savedId && wallets.some(wallet => wallet.id === savedId)
          ? savedId
          : wallets[0]?.id ?? null;
        this.setActiveWallet(activeId, false);
        if (activeId) this.refreshWalletData();
      }),
      finalize(() => {
        this.walletsRequest$ = null;
      }),
      shareReplay(1)
    );

    this.walletsRequest$ = request$;
    return request$;
  }

  createWallet(payload: WalletPayload): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/wallets`, payload).pipe(
      tap(wallet => {
        this._wallets.update(items => [wallet, ...items]);
        if (!this._activeWalletId()) this.setActiveWallet(wallet.id);
      })
    );
  }

  updateWallet(id: string, payload: WalletPayload): Observable<Wallet> {
    return this.http.patch<Wallet>(`${this.apiUrl}/wallets/${id}`, payload).pipe(
      tap(updated => this._wallets.update(items => items.map(item => item.id === id ? updated : item)))
    );
  }

  deleteWallet(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.apiUrl}/wallets/${id}`).pipe(
      tap(() => {
        this._wallets.update(items => items.filter(item => item.id !== id));
        if (this._activeWalletId() === id) {
          this.setActiveWallet(this._wallets()[0]?.id ?? null);
        }
      })
    );
  }

  setActiveWallet(walletId: string | null, refreshData = true): void {
    this._activeWalletId.set(walletId);
    if (walletId) sessionStorage.setItem(ACTIVE_WALLET_KEY, walletId);
    else sessionStorage.removeItem(ACTIVE_WALLET_KEY);

    this._categories.set([]);
    this._movements.set([]);

    if (walletId && refreshData) {
      this.listCategories().subscribe();
      this.listMovements({ page: 1, limit: 100 }).subscribe();
    }
  }

  listCategories(type?: MovementType): Observable<Category[]> {
    const walletId = this.requireWalletId();
    if (!walletId) return of([]);
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    return this.http.get<Category[]>(`${this.apiUrl}/wallets/${walletId}/categories`, { params }).pipe(
      tap(categories => {
        if (!type) this._categories.set(categories);
      })
    );
  }

  getCategoriesByType(type: MovementType): Observable<Category[]> {
    return this.listCategories(type);
  }

  createCategory(payload: CategoryPayload): Observable<Category> {
    const walletId = this.requireWalletId();
    if (!walletId) return throwError(() => new Error('Nenhuma carteira selecionada.'));
    return this.http.post<Category>(`${this.apiUrl}/wallets/${walletId}/categories`, payload).pipe(
      tap(category => this._categories.update(items => [...items, category].sort((a, b) => a.name.localeCompare(b.name))))
    );
  }

  deleteCategory(id: string): Observable<boolean> {
    const walletId = this.requireWalletId();
    if (!walletId) return of(false);
    return this.http.delete<{ deleted: boolean }>(`${this.apiUrl}/wallets/${walletId}/categories/${id}`).pipe(
      tap(() => this._categories.update(items => items.filter(category => category.id !== id))),
      map(() => true),
      catchError(() => of(false))
    );
  }

  listMovements(filters: MovementFilters = {}): Observable<PaginatedResponse<Movement>> {
    const walletId = this.requireWalletId();
    if (!walletId) {
      return of({ data: [], meta: { page: 1, limit: filters.limit ?? 10, total: 0, totalPages: 0 } });
    }

    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    });

    return this.http.get<PaginatedResponse<Movement>>(`${this.apiUrl}/wallets/${walletId}/movements`, { params }).pipe(
      tap(response => {
        this._movements.set(response.data);
        this._movementMeta.set(response.meta);
      })
    );
  }

  getMovementById(id: string): Observable<Movement | undefined> {
    const walletId = this.requireWalletId();
    if (!walletId) return of(undefined);
    return this.http.get<Movement>(`${this.apiUrl}/wallets/${walletId}/movements/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }

  createMovement(payload: MovementPayload): Observable<Movement> {
    const walletId = this.requireWalletId();
    if (!walletId) return throwError(() => new Error('Nenhuma carteira selecionada.'));
    return this.http.post<Movement>(`${this.apiUrl}/wallets/${walletId}/movements`, payload).pipe(
      tap(movement => this._movements.update(items => [movement, ...items]))
    );
  }

  updateMovement(id: string, payload: MovementPayload): Observable<Movement | undefined> {
    const walletId = this.requireWalletId();
    if (!walletId) return of(undefined);
    return this.http.patch<Movement>(`${this.apiUrl}/wallets/${walletId}/movements/${id}`, payload).pipe(
      tap(updated => this._movements.update(items => items.map(item => item.id === id ? updated : item)))
    );
  }

  deleteMovement(id: string): Observable<void> {
    const walletId = this.requireWalletId();
    if (!walletId) return of(void 0);
    return this.http.delete<{ deleted: boolean }>(`${this.apiUrl}/wallets/${walletId}/movements/${id}`).pipe(
      tap(() => this._movements.update(items => items.filter(item => item.id !== id))),
      map(() => void 0)
    );
  }

  getDashboard(filters: { startDate?: string; endDate?: string; categoryId?: string } = {}): Observable<DashboardResponse> {
    const walletId = this.requireWalletId();
    if (!walletId) return throwError(() => new Error('Nenhuma carteira selecionada.'));
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    return this.http.get<DashboardResponse>(`${this.apiUrl}/wallets/${walletId}/dashboard`, { params });
  }

  refreshWalletData(): void {
    if (!this._activeWalletId()) return;
    this.listCategories().subscribe();
    this.listMovements({ page: 1, limit: 100 }).subscribe();
  }

  private requireWalletId(): string | null {
    return this._activeWalletId();
  }
}
