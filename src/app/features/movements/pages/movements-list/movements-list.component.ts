import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import type { PaginatorState } from 'primeng/types/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { FinanceService } from '../../../../core/services/finance.service';
import { MovementType } from '../../../../models/finance.models';

@Component({
  selector: 'app-movements-list',
  standalone: true,
  imports: [RouterLink, FormsModule, ButtonModule, DatePickerModule, InputTextModule, PaginatorModule, SelectModule, TableModule, ToastModule, TooltipModule],
  providers: [MessageService],
  templateUrl: './movements-list.component.html',
  styleUrl: './movements-list.component.scss'
})
export class MovementsListComponent {
  readonly financeService = inject(FinanceService);
  private readonly messageService = inject(MessageService);

  readonly search = signal('');
  readonly type = signal<MovementType | 'all'>('all');
  readonly categoryId = signal<string | 'all'>('all');
  readonly period = signal<Date[] | null>(null);
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = 10;
  readonly paginatorTotalRecords = computed(() => Math.max(this.financeService.movementMeta().total, 1));

  readonly typeOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Receitas', value: 'income' },
    { label: 'Despesas', value: 'expense' }
  ];

  readonly categoryOptions = computed(() => [
    { name: 'Todas', id: 'all' },
    ...this.financeService.categories()
  ]);

  constructor() {
    this.load();
  }

  load(page = this.currentPage()): void {
    this.currentPage.set(page);
    this.loading.set(true);
    const range = this.period();
    this.financeService.listMovements({
      search: this.search().trim() || undefined,
      type: this.type() === 'all' ? undefined : this.type(),
      categoryId: this.categoryId() === 'all' ? undefined : this.categoryId(),
      startDate: range?.[0] ? this.toDateString(range[0]) : undefined,
      endDate: range?.[1] ? this.toDateString(range[1]) : undefined,
      page,
      limit: this.pageSize,
      sortBy: 'date',
      sortOrder: 'desc'
    }).subscribe({
      next: response => {
        this.loading.set(false);
        if (page > 1 && response.data.length === 0 && response.meta.totalPages < page) {
          this.load(page - 1);
        }
      },
      error: error => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível carregar as movimentações.' });
      }
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.type.set('all');
    this.categoryId.set('all');
    this.period.set(null);
    this.applyFilters();
  }

  applyFilters(): void {
    this.load(1);
  }

  changePage(event: PaginatorState): void {
    if (this.loading()) return;
    this.load((event.page ?? 0) + 1);
  }

  categoryName(id: string): string {
    return this.financeService.categories().find(category => category.id === id)?.name ?? 'Sem categoria';
  }

  categoryColor(id: string): string {
    return this.financeService.categories().find(category => category.id === id)?.color ?? '#64748B';
  }

  remove(id: string): void {
    this.financeService.deleteMovement(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Movimentação excluída', detail: 'Registro removido com sucesso.' });
        this.load();
      },
      error: error => this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível excluir a movimentação.' })
    });
  }

  formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
