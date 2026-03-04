// =============================================================================
// Data Types
// =============================================================================

/** Represents an individual milk production entry for a cow. Enforces uniqueness per cow, date, and milkingTime. */
export interface MilkRecord {
  id: string;
  cowId: string;
  date: string; // YYYY-MM-DD
  milkingTime: 'AM' | 'PM';
  amount: number; // Liters
}

export type FinancialTransactionType = 'expense' | 'income';
export type ExpenseCategory = 'Feed' | 'Veterinary' | 'Breeding / AI' | 'Labor' | 'Utilities' | 'Maintenance / Miscellaneous';
export type IncomeCategory = 'Milk Sales' | 'Cow Sales' | 'Other Income';

/** Represents a financial transaction (expense or income) for the farm. */
export interface FinancialTransaction {
  id: string;
  type: FinancialTransactionType;
  category: ExpenseCategory | IncomeCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  description?: string;
  cowId?: string; // Optional: for transactions related to a specific cow (e.g., cow sale)
}

/** Aggregated financial and production metrics for a selected period. */
export interface ProductionFinanceOverview {
  totalMilkProduction: number; // in Liters
  totalIncome: number; // in INR
  totalExpenses: number; // in INR
  netProfitLoss: number; // in INR
  currentPeriod: string; // System-controlled, e.g., "January 2026"
}

/** Simplified Cow data for ranking top/low producers. */
export interface CowPerformanceMetric {
  cowId: string;
  name: string | null;
  tagId: string;
  avgDailyMilk: number; // Average daily milk production for the current period
}

/** Simplified Expense data for ranking highest expense categories. */
export interface ExpenseCategoryMetric {
  categoryName: ExpenseCategory;
  totalAmount: number;
}


// =============================================================================
// Component Props
// =============================================================================

export interface ProductionFinanceProps {
  /** The aggregated overview data for the Production & Finance section. */
  overview: ProductionFinanceOverview;
  /** The list of cows ranked by top milk production. */
  topProducingCows: CowPerformanceMetric[];
  /** The list of cows ranked by low milk production (excluding dry/inactive cows). */
  lowProducingCows: CowPerformanceMetric[];
  /** The list of expense categories ranked by total amount. */
  highestExpenseCategories: ExpenseCategoryMetric[];
  
  /** Called when the user wants to initiate a bulk milk record entry. */
  onRecordMilkBulk?: () => void;
  /** Called when the user wants to log a new financial transaction. */
  onLogFinancialTransaction?: () => void;
  /** Called when a cow in an insight list is clicked to view its profile. */
  onViewCowDetails?: (cowId: string) => void;
  /** Called when the user wants to change the reporting period for the overview. */
  onPeriodChange?: (period: string) => void;
  /** Called after a successful data entry to refresh the dashboard. */
  onSuccess?: () => void;
}
