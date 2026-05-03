// ============================================================
// Shared Types for Financials Module
// ============================================================

export type TransactionType = 'income' | 'expense';
export type PersonRole = 'owner' | 'family' | 'worker';
export type LoanType = 'simple' | 'compound';
export type LoanStatus = 'active' | 'closed';

export const EXPENSE_CATEGORIES = [
    'Feed',
    'Medical',
    'Labor',
    'Infrastructure',
    'Veterinary',
    'Breeding / AI',
    'Utilities',
    'Maintenance / Miscellaneous',
    'Other',
] as const;

export const INCOME_CATEGORIES = [
    'Milk Sales',
    'Cow Sales',
    'Cow Dung Sales',
    'Other Income',
] as const;


export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];

export interface FinancialTransaction {
    id: string;
    type: TransactionType;
    category: string;
    amount: number;
    date: string;
    description?: string;
    paidById?: string;
    paidBy?: Person;
    cowId?: string;
    createdAt: string;
}

export interface Person {
    id: string;
    name: string;
    role: PersonRole;
    notes?: string;
    farmId: string;
    createdAt: string;
}

export interface LoanPayment {
    id: string;
    loanId: string;
    paymentDate: string;
    amountPaid: number;
    interestComponent: number;
    principalComponent: number;
    notes?: string;
    createdAt: string;
}

export interface Loan {
    id: string;
    farmId: string;
    lenderName: string;
    principalAmount: number;
    interestRate: number;
    startDate: string;
    type: LoanType;
    status: LoanStatus;
    notes?: string;
    payments: LoanPayment[];
    outstandingBalance: number;
    totalPaid: number;
    accruedInterest: number;
    createdAt: string;
}

export interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
}

export interface SpendingByPerson {
    personId: string;
    name: string;
    role: PersonRole;
    amount: number;
    pendingReimbursement: boolean;
}

export interface MonthlySummary {
    period: string;
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    expenseByCategory: CategoryBreakdown[];
    incomeByCategory: CategoryBreakdown[];
    recentTransactions: FinancialTransaction[];
    spendingByPerson: SpendingByPerson[];
}

// Tab type for navigation
export type FinancialsTab = 'transactions' | 'loans' | 'summary' | 'people';
