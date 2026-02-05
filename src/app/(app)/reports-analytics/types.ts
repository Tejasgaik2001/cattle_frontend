// =============================================================================
// Data Types
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


// =============================================================================
// Component Props
// =============================================================================

export interface ReportsAnalyticsProps {
  /** The aggregated report data for the Reports & Analytics section. */
  data: ReportsAnalyticsData;

  /** Called when the user wants to change the reporting period. */
  onSelectPeriod?: (period: ReportPeriod) => void;
  /** Called when a user drills down from a milk trend chart to see detailed records. */
  onDrillDownMilkTrend?: (dateRange: { startDate: string; endDate: string }) => void;
  /** Called when a cow in a performance report is clicked to view its profile. */
  onViewCowDetails?: (cowId: string) => void;
  /** Called when the user wants to export data from a report (e.g., as CSV). */
  onExportData?: (reportType: string, format: 'CSV' | 'PDF') => void;
}

// For Milk Production Trend Drill-down View
export interface MilkRecordsListProps {
  cowId?: string; // Optional: if drilling down to a specific cow's milk records
  dateRange: { startDate: string; endDate: string };
  milkRecords: MilkProductionTrendData[]; // Or a more detailed MilkRecord type
  onViewCowDetails?: (cowId: string) => void;
  onBackToReport?: () => void;
}
