import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FinanceService } from '../../../../core/services/finance.service';
import { DashboardResponse } from '../../../../models/finance.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule, DatePickerModule, SelectModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly financeService = inject(FinanceService);
  private readonly dashboard = signal<DashboardResponse | null>(null);

  selectedPeriod: Date[] = this.currentMonthRange();

  readonly totalIncome = computed(() => this.dashboard()?.summary.totalIncome ?? 0);
  readonly totalExpense = computed(() => this.dashboard()?.summary.totalExpense ?? 0);
  readonly currentBalance = computed(() => this.dashboard()?.summary.balance ?? 0);
  readonly totalMovements = computed(() => this.dashboard()?.summary.totalMovements ?? 0);
  readonly averageExpense = computed(() => this.dashboard()?.summary.averageExpense ?? 0);
  readonly biggestIncome = computed(() => this.dashboard()?.highlights.biggestIncome ?? null);
  readonly biggestExpense = computed(() => this.dashboard()?.highlights.biggestExpense ?? null);
  readonly categoryExpenses = computed(() => this.dashboard()?.categoryExpenses ?? []);
  readonly hasPreviousPeriodData = computed(() => this.dashboard()?.comparison.hasPreviousPeriodData ?? false);
  readonly savingPercentage = computed(() => this.dashboard()?.comparison.percentage ?? 0);
  readonly hasSavedComparedToPreviousPeriod = computed(() => this.dashboard()?.comparison.improved ?? false);

  readonly categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: { legend: { display: false }, tooltip: { enabled: true } }
  };

  readonly miniChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } }
  };

  readonly incomeExpenseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, align: 'end' as const, labels: { usePointStyle: true, boxWidth: 8 } }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { color: '#eef2f7' },
        ticks: { callback: (value: string | number) => `R$ ${Number(value).toLocaleString('pt-BR')}` }
      }
    }
  };

  readonly incomeExpenseChart = computed(() => {
    const items = this.dashboard()?.incomeExpenseByDate ?? [];
    return {
      labels: items.map(item => this.formatShortDate(item.date)),
      datasets: [
        { label: 'Receitas', data: items.map(item => item.income), borderColor: '#4ade80', backgroundColor: '#4ade80', tension: .35, borderWidth: 3, pointRadius: 4 },
        { label: 'Despesas', data: items.map(item => item.expense), borderColor: '#fb7185', backgroundColor: '#fb7185', tension: .35, borderWidth: 3, pointRadius: 4 }
      ]
    };
  });

  readonly categoryChart = computed(() => ({
    labels: this.categoryExpenses().map(category => category.name),
    datasets: [{
      data: this.categoryExpenses().map(category => category.amount),
      backgroundColor: this.categoryExpenses().map(category => category.color),
      borderWidth: 0,
      hoverOffset: 5
    }]
  }));

  readonly incomeMiniChart = computed(() => this.buildMiniChart('income'));
  readonly expenseMiniChart = computed(() => this.buildMiniChart('expense'));
  readonly balanceMiniChart = computed(() => {
    const items = this.dashboard()?.incomeExpenseByDate ?? [];
    let balance = 0;
    return {
      labels: items.map(item => this.formatShortDate(item.date)),
      datasets: [{
        data: items.map(item => balance += item.income - item.expense),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, .10)',
        fill: true,
        tension: .4,
        pointRadius: 0,
        borderWidth: 2
      }]
    };
  });

  constructor() {
    effect(() => {
      const walletId = this.financeService.activeWalletId();
      if (walletId) this.loadDashboard();
    });
  }

  loadDashboard(): void {
    if (!this.financeService.activeWalletId()) return;
    const [start, end] = this.selectedPeriod ?? [];
    if (!start || !end) return;

    this.financeService.getDashboard({
      startDate: this.toDateString(start),
      endDate: this.toDateString(end)
    }).subscribe(response => this.dashboard.set(response));
  }

  clearFilters(): void {
    this.selectedPeriod = this.currentMonthRange();
    this.loadDashboard();
  }

  private buildMiniChart(type: 'income' | 'expense') {
    const items = this.dashboard()?.incomeExpenseByDate ?? [];
    const isIncome = type === 'income';
    return {
      labels: items.map(item => this.formatShortDate(item.date)),
      datasets: [{
        data: items.map(item => isIncome ? item.income : item.expense),
        borderColor: isIncome ? '#16a34a' : '#ef4444',
        backgroundColor: isIncome ? 'rgba(22, 163, 74, .10)' : 'rgba(239, 68, 68, .10)',
        fill: true,
        tension: .4,
        pointRadius: 0,
        borderWidth: 2
      }]
    };
  }

  private currentMonthRange(): Date[] {
    const now = new Date();
    return [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)];
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatShortDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
}
