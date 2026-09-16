export interface PopulationReportSummary {
  residents: number
  households: number
  puroks: number
}

export interface CertificateReportSummary {
  total: number
  pending: number
  approved: number
  issued: number
  rejected: number
}

export interface BlotterReportSummary {
  total: number

  open: number
  under_mediation: number

  settled: number
  referred: number
  dismissed: number
  closed: number

  low: number
  normal: number
  high: number
  urgent: number
}

export interface ReportsSummary {
  population:
    PopulationReportSummary

  certificates:
    CertificateReportSummary

  blotter:
    BlotterReportSummary
}

// ========================================
// REPORT FILTERS
// ========================================

export interface ReportFilters {
  startDate?: string
  endDate?: string
}

// ========================================
// CERTIFICATE DETAIL ROW
// ========================================

export interface CertificateReportRow {
  id: string
  request_number: string
  status: string
  created_at: string
}

// ========================================
// BLOTTER DETAIL ROW
// ========================================

export interface BlotterReportRow {
  id: string
  case_number: string
  complaint_type: string
  incident_date: string
  priority: string
  status: string
}

// ========================================
// DETAILED REPORT DATA
// ========================================

export interface DetailedReportsData {
  certificates:
    CertificateReportRow[]

  blotter:
    BlotterReportRow[]
}