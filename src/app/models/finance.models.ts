export type MovementType = 'income' | 'expense' | 'all';
export type WalletType = 'personal' | 'business';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletPayload {
  name: string;
  type: WalletType;
  color: string;
}

export interface Category {
  id: string;
  walletId: string;
  name: string;
  type: MovementType;
  color: string;
  isDefault: boolean;
  defaultKey?: string | null;
}

export interface Movement {
  id: string;
  walletId: string;
  type: MovementType;
  description: string;
  categoryId: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes?: string;
}

export interface CategoryPayload {
  name: string;
  type: MovementType;
  color: string;
}

export interface MovementPayload {
  type: MovementType;
  description: string;
  categoryId: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes?: string;
}

export interface MovementFilters {
  search?: string;
  type?: MovementType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'description';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardResponse {
  period: { startDate: string; endDate: string };
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    totalMovements: number;
    averageExpense: number;
  };
  highlights: {
    biggestIncome: MovementHighlight | null;
    biggestExpense: MovementHighlight | null;
  };
  comparison: {
    previousBalance: number;
    difference: number;
    percentage: number;
    hasPreviousPeriodData: boolean;
    improved: boolean;
  };
  categoryExpenses: Array<{
    id: string;
    name: string;
    color: string;
    amount: number;
    percentage: number;
  }>;
  incomeExpenseByDate: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
  recentMovements: Movement[];
}

export interface MovementHighlight {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  type: MovementType;
}
