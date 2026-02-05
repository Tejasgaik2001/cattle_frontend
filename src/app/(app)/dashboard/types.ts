// =============================================================================
// Data Types
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

// Note: Cow, CowEvent, and MilkRecord types would be defined globally
// based on the data-model.md but are included here for section context if needed.

// =============================================================================
// Component Props
// =============================================================================

export interface DashboardAlertsProps {
  /** The aggregated summary data for the dashboard. */
  summary: DashboardSummary;
  
  /** The list of critical alerts to display. */
  alerts: Alert[];
  
  /** Called when a user taps on an alert to see details. */
  onViewAlertAction?: (alertId: string, cowId: string) => void;
  
  /** Called when the user wants to record milk for a cow. */
  onRecordMilk?: () => void;
  
  /** Called when the user wants to log a new health event. */
  onLogHealthEvent?: () => void;
  
  /** Called when the user wants to add a new cow. */
  onAddCow?: () => void;
}
