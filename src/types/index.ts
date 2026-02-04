// =============================================================================
// Herd Management Data Types
// =============================================================================

/** Represents an individual animal in the herd, containing its core profile and lifecycle status. */
export interface Cow {
    id: string;
    tagId: string;
    name: string | null;
    gender: 'male' | 'female';
    breed: string;
    dateOfBirth: string; // YYYY-MM-DD
    acquisitionDate: string; // YYYY-MM-DD
    lifecycleStatus: 'active' | 'sold' | 'deceased';
    acquisitionSource: string | null;
    motherId: string | null;
}

// Metadata interfaces for CowEvent types
export interface VaccinationMetadata {
    vaccineName: string;
    nextDueDate?: string; // YYYY-MM-DD
}

export interface BreedingMetadata {
    sire: string;
    method: 'AI' | 'Natural';
    expectedCalvingDate?: string; // YYYY-MM-DD
}

export interface HealthMetadata {
    symptoms: string[];
    treatment: string;
    diagnosis: string;
}

export interface FinancialMetadata {
    salePrice?: number;
    buyerName?: string;
    // Potentially other financial details for a cow transaction
}

/** A specific, categorized event in a cow's life, forming its chronological activity timeline. */
export interface CowEvent {
    id: string;
    cowId: string;
    type: 'HEALTH' | 'VACCINATION' | 'BREEDING' | 'NOTE' | 'FINANCIAL'; // Strict enum
    date: string; // ISO date string or YYYY-MM-DD
    description: string;
    metadata?: VaccinationMetadata | BreedingMetadata | HealthMetadata | FinancialMetadata | { [key: string]: any }; // Structured metadata
}

// =============================================================================
// Health & Breeding Data Types
// =============================================================================

/** High-level aggregated metrics for herd health and breeding status. */
export interface HealthBreedingOverview {
    cowsUnderTreatment: number;
    pregnantCows: number;
    healthIssuesLast7Days: number;
    vaccinationsDueOverdueCount: number;
}

/** Represents an actionable item derived from CowEvents, representing an upcoming or overdue task. */
export interface HealthBreedingTask {
    id: string;
    cowId: string;
    cowTagId: string;
    cowName: string | null;
    taskType: 'VACCINATION_DUE' | 'HEALTH_FOLLOWUP' | 'PREGNANCY_CHECK' | 'CALVING_EXPECTED' | 'BREEDING_RECOMMENDATION'; // Strict enum of task types
    dueDate: string; // YYYY-MM-DD
    urgency: 'high' | 'medium' | 'low'; // System-derived priority
    message: string; // System-generated, human-readable summary
}

// =============================================================================
// Production & Finance Data Types
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
// Dashboard & Alerts Data Types
// =============================================================================

/** High-level aggregated data for display on the dashboard. */
export interface DashboardSummary {
    totalHerdSize: number;
    lactatingCowsCount: number;
    pregnantCowsCount: number;
    cowsUnderTreatmentCount: number;
    todayMilkTotal: number;
    yesterdayMilkTotal: number;
}

/** Represents a single critical alert that requires user attention. */
export interface Alert {
    id: string;
    type: 'vaccination_due' | 'health_issue' | 'missing_data';
    title: string;
    message: string;
    cowId: string;
    priority: 'high' | 'medium' | 'low';
    createdAt: string; // ISO date string
}

// =============================================================================
// Reports & Analytics Data Types
// =============================================================================

/** Defines the start, end, and label for a reporting period. */
export interface ReportPeriod {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    label: string; // e.g., "Full Year 2025", "Jan 2026"
}

/** Monthly milk production totals for trend visualization. */
export interface MilkProductionTrendData {
    month: string; // e.g., "Jan 2025"
    totalMilk: number; // in Liters
}

/** Monthly financial performance data for trend visualization. */
export interface FinancialTrendData {
    month: string; // e.g., "Jan 2025"
    income: number;
    expenses: number;
    profit: number;
}

/** Expense totals per category for a period. */
export interface ExpenseBreakdownData {
    category: string;
    amount: number;
}

/** Cow-specific performance metrics for ranking and comparison. */
export interface CowPerformanceData {
    cowId: string;
    name: string | null;
    tagId: string;
    avgDailyMilk: number; // Average daily milk production for the period
    rank?: number; // Optional: Rank among the herd
}

/** Aggregated metrics for health and breeding performance. */
export interface HealthBreedingSummaryData {
    totalHealthEvents: number;
    vaccinationComplianceRate: number; // Percentage
    successfulBreedingRate: number; // Percentage
    calvingRate: number; // Percentage
}

/** Represents the aggregated data for the Reports & Analytics section. */
export interface ReportsAnalyticsData {
    currentReportPeriod: ReportPeriod;
    milkProductionTrends: MilkProductionTrendData[];
    financialPerformance: {
        incomeExpenseTrend: FinancialTrendData[];
        expenseBreakdown: ExpenseBreakdownData[];
    };
    cowPerformance: CowPerformanceData[];
    healthBreedingSummary: HealthBreedingSummaryData;
}
