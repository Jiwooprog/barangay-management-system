import {
  Workbook,
  type Cell,
  type Row,
  type Worksheet,
} from "exceljs"

import type {
  BlotterReportRow,
  CertificateReportRow,
  ReportFilters,
  ReportsSummary,
} from "@/features/reports/types"

// ========================================
// TYPES
// ========================================

interface ExportReportsExcelInput {
  summary: ReportsSummary

  certificates:
    CertificateReportRow[]

  blotter:
    BlotterReportRow[]

  filters:
    ReportFilters
}

// ========================================
// FORMAT DATE
// ========================================

function formatDate(
  value: string
) {
  const date =
    value.length === 10
      ? new Date(
          `${value}T00:00:00`
        )
      : new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date)
}

// ========================================
// FORMAT LABEL
// ========================================

function formatLabel(
  value: string
) {
  return value
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    )
}

// ========================================
// REPORT PERIOD
// ========================================

function getReportPeriod(
  filters: ReportFilters
) {
  if (
    !filters.startDate &&
    !filters.endDate
  ) {
    return "All available records"
  }

  if (
    filters.startDate &&
    filters.endDate
  ) {
    return `${formatDate(
      filters.startDate
    )} - ${formatDate(
      filters.endDate
    )}`
  }

  if (
    filters.startDate
  ) {
    return `From ${formatDate(
      filters.startDate
    )}`
  }

  if (
    filters.endDate
  ) {
    return `Through ${formatDate(
      filters.endDate
    )}`
  }

  return "All available records"
}

// ========================================
// TITLE STYLE
// ========================================

function styleTitle(
  worksheet: Worksheet,
  range: string
) {
  worksheet.mergeCells(
    range
  )

  const firstCell =
    range.split(":")[0]

  const cell =
    worksheet.getCell(
      firstCell
    )

  cell.font = {
    bold: true,
    size: 16,
  }

  cell.alignment = {
    vertical:
      "middle",

    horizontal:
      "center",
  }
}

// ========================================
// SECTION HEADER STYLE
// ========================================

function styleSectionHeader(
  cell: Cell
) {
  cell.font = {
    bold: true,
    size: 12,
  }

  cell.fill = {
    type: "pattern",
    pattern: "solid",

    fgColor: {
      argb:
        "FFE5E7EB",
    },
  }
}

// ========================================
// TABLE HEADER STYLE
// ========================================

function styleTableHeader(
  row: Row
) {
  row.font = {
    bold: true,

    color: {
      argb:
        "FFFFFFFF",
    },
  }

  row.fill = {
    type: "pattern",
    pattern: "solid",

    fgColor: {
      argb:
        "FF1F2937",
    },
  }

  row.alignment = {
    vertical:
      "middle",
  }

  row.height = 22

  row.eachCell(
    (cell) => {
      cell.border = {
        top: {
          style:
            "thin",
        },

        left: {
          style:
            "thin",
        },

        bottom: {
          style:
            "thin",
        },

        right: {
          style:
            "thin",
        },
      }
    }
  )
}

// ========================================
// ADD TABLE BORDERS
// ========================================

function addBorders(
  worksheet: Worksheet,
  startRow: number,
  endRow: number,
  columnCount: number
) {
  for (
    let rowNumber =
      startRow;
    rowNumber <=
    endRow;
    rowNumber += 1
  ) {
    const row =
      worksheet.getRow(
        rowNumber
      )

    for (
      let columnNumber =
        1;
      columnNumber <=
      columnCount;
      columnNumber += 1
    ) {
      const cell =
        row.getCell(
          columnNumber
        )

      cell.border = {
        top: {
          style:
            "thin",

          color: {
            argb:
              "FFE5E7EB",
          },
        },

        left: {
          style:
            "thin",

          color: {
            argb:
              "FFE5E7EB",
          },
        },

        bottom: {
          style:
            "thin",

          color: {
            argb:
              "FFE5E7EB",
          },
        },

        right: {
          style:
            "thin",

          color: {
            argb:
              "FFE5E7EB",
          },
        },
      }
    }
  }
}

// ========================================
// MAIN EXPORT FUNCTION
// ========================================

export async function exportReportsExcel({
  summary,
  certificates,
  blotter,
  filters,
}: ExportReportsExcelInput) {
  const workbook =
    new Workbook()

  workbook.creator =
    "Barangay Management System"

  workbook.created =
    new Date()

  // ========================================
  // FILTERED CERTIFICATE COUNTS
  // ========================================

  const certificateCounts = {
    total:
      certificates.length,

    pending:
      certificates.filter(
        (item) =>
          item.status ===
          "pending"
      ).length,

    approved:
      certificates.filter(
        (item) =>
          item.status ===
          "approved"
      ).length,

    issued:
      certificates.filter(
        (item) =>
          item.status ===
          "issued"
      ).length,

    rejected:
      certificates.filter(
        (item) =>
          item.status ===
          "rejected"
      ).length,
  }

  // ========================================
  // FILTERED BLOTTER COUNTS
  // ========================================

  const blotterCounts = {
    total:
      blotter.length,

    open:
      blotter.filter(
        (item) =>
          item.status ===
          "open"
      ).length,

    underMediation:
      blotter.filter(
        (item) =>
          item.status ===
          "under_mediation"
      ).length,

    settled:
      blotter.filter(
        (item) =>
          item.status ===
          "settled"
      ).length,

    referred:
      blotter.filter(
        (item) =>
          item.status ===
          "referred"
      ).length,

    dismissed:
      blotter.filter(
        (item) =>
          item.status ===
          "dismissed"
      ).length,

    closed:
      blotter.filter(
        (item) =>
          item.status ===
          "closed"
      ).length,

    low:
      blotter.filter(
        (item) =>
          item.priority ===
          "low"
      ).length,

    normal:
      blotter.filter(
        (item) =>
          item.priority ===
          "normal"
      ).length,

    high:
      blotter.filter(
        (item) =>
          item.priority ===
          "high"
      ).length,

    urgent:
      blotter.filter(
        (item) =>
          item.priority ===
          "urgent"
      ).length,
  }

  // ========================================
  // SUMMARY WORKSHEET
  // ========================================

  const summarySheet =
    workbook.addWorksheet(
      "Summary"
    )

  summarySheet.columns = [
    {
      width: 36,
    },

    {
      width: 24,
    },
  ]

  summarySheet.addRow([
    "Barangay Management System - Reports",
  ])

  styleTitle(
    summarySheet,
    "A1:B1"
  )

  summarySheet.getRow(
    1
  ).height = 28

  summarySheet.addRow([
    "Report Period",
    getReportPeriod(
      filters
    ),
  ])

  summarySheet.addRow([
    "Generated",
    new Intl.DateTimeFormat(
      "en-PH",
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    ).format(
      new Date()
    ),
  ])

  summarySheet.addRow([])

  // ========================================
  // POPULATION SUMMARY
  // ========================================

  summarySheet.addRow([
    "Population Snapshot",
    "",
  ])

  styleSectionHeader(
    summarySheet.getCell(
      "A5"
    )
  )

  summarySheet.addRow([
    "Residents",
    summary.population
      .residents,
  ])

  summarySheet.addRow([
    "Households",
    summary.population
      .households,
  ])

  summarySheet.addRow([
    "Puroks",
    summary.population
      .puroks,
  ])

  summarySheet.addRow([])

  // ========================================
  // CERTIFICATE SUMMARY
  // ========================================

  summarySheet.addRow([
    "Certificate Requests - Selected Period",
    "",
  ])

  styleSectionHeader(
    summarySheet.getCell(
      "A10"
    )
  )

  summarySheet.addRow([
    "Total Requests",
    certificateCounts.total,
  ])

  summarySheet.addRow([
    "Pending",
    certificateCounts.pending,
  ])

  summarySheet.addRow([
    "Approved",
    certificateCounts.approved,
  ])

  summarySheet.addRow([
    "Issued",
    certificateCounts.issued,
  ])

  summarySheet.addRow([
    "Rejected",
    certificateCounts.rejected,
  ])

  summarySheet.addRow([])

  // ========================================
  // BLOTTER STATUS SUMMARY
  // ========================================

  summarySheet.addRow([
    "Peace & Order - Selected Period",
    "",
  ])

  styleSectionHeader(
    summarySheet.getCell(
      "A17"
    )
  )

  summarySheet.addRow([
    "Total Cases",
    blotterCounts.total,
  ])

  summarySheet.addRow([
    "Open",
    blotterCounts.open,
  ])

  summarySheet.addRow([
    "Under Mediation",
    blotterCounts.underMediation,
  ])

  summarySheet.addRow([
    "Settled",
    blotterCounts.settled,
  ])

  summarySheet.addRow([
    "Referred",
    blotterCounts.referred,
  ])

  summarySheet.addRow([
    "Dismissed",
    blotterCounts.dismissed,
  ])

  summarySheet.addRow([
    "Closed",
    blotterCounts.closed,
  ])

  summarySheet.addRow([])

  // ========================================
  // PRIORITY SUMMARY
  // ========================================

  summarySheet.addRow([
    "Priority Breakdown",
    "",
  ])

  styleSectionHeader(
    summarySheet.getCell(
      "A26"
    )
  )

  summarySheet.addRow([
    "Low",
    blotterCounts.low,
  ])

  summarySheet.addRow([
    "Normal",
    blotterCounts.normal,
  ])

  summarySheet.addRow([
    "High",
    blotterCounts.high,
  ])

  summarySheet.addRow([
    "Urgent",
    blotterCounts.urgent,
  ])

  // ========================================
  // CERTIFICATES WORKSHEET
  // ========================================

  const certificateSheet =
    workbook.addWorksheet(
      "Certificates"
    )

  certificateSheet.columns = [
    {
      width: 26,
    },

    {
      width: 22,
    },

    {
      width: 20,
    },
  ]

  certificateSheet.addRow([
    "Certificate Request Report",
  ])

  styleTitle(
    certificateSheet,
    "A1:C1"
  )

  certificateSheet.addRow([
    "Report Period",
    getReportPeriod(
      filters
    ),
  ])

  certificateSheet.addRow([])

  const certificateHeader =
    certificateSheet.addRow([
      "Request #",
      "Date",
      "Status",
    ])

  styleTableHeader(
    certificateHeader
  )

  certificates.forEach(
    (item) => {
      certificateSheet.addRow([
        item.request_number,

        formatDate(
          item.created_at
        ),

        formatLabel(
          item.status
        ),
      ])
    }
  )

  if (
    certificates.length ===
    0
  ) {
    certificateSheet.addRow([
      "No records found",
      "",
      "",
    ])
  }

  addBorders(
    certificateSheet,
    4,
    certificateSheet.rowCount,
    3
  )

  certificateSheet.autoFilter = {
    from: "A4",
    to: "C4",
  }

  certificateSheet.views = [
    {
      state:
        "frozen",

      ySplit:
        4,
    },
  ]

  // ========================================
  // PEACE & ORDER WORKSHEET
  // ========================================

  const blotterSheet =
    workbook.addWorksheet(
      "Peace & Order"
    )

  blotterSheet.columns = [
    {
      width: 26,
    },

    {
      width: 40,
    },

    {
      width: 22,
    },

    {
      width: 18,
    },

    {
      width: 24,
    },
  ]

  blotterSheet.addRow([
    "Peace & Order Case Report",
  ])

  styleTitle(
    blotterSheet,
    "A1:E1"
  )

  blotterSheet.addRow([
    "Report Period",
    getReportPeriod(
      filters
    ),
  ])

  blotterSheet.addRow([])

  const blotterHeader =
    blotterSheet.addRow([
      "Case #",
      "Complaint",
      "Incident Date",
      "Priority",
      "Status",
    ])

  styleTableHeader(
    blotterHeader
  )

  blotter.forEach(
    (item) => {
      blotterSheet.addRow([
        item.case_number,

        item.complaint_type,

        formatDate(
          item.incident_date
        ),

        formatLabel(
          item.priority
        ),

        formatLabel(
          item.status
        ),
      ])
    }
  )

  if (
    blotter.length ===
    0
  ) {
    blotterSheet.addRow([
      "No records found",
      "",
      "",
      "",
      "",
    ])
  }

  addBorders(
    blotterSheet,
    4,
    blotterSheet.rowCount,
    5
  )

  blotterSheet.autoFilter = {
    from: "A4",
    to: "E4",
  }

  blotterSheet.views = [
    {
      state:
        "frozen",

      ySplit:
        4,
    },
  ]

  // ========================================
  // GENERATE EXCEL FILE
  // ========================================

  const buffer =
    await workbook.xlsx.writeBuffer()

  const blob =
    new Blob(
      [
        buffer as BlobPart,
      ],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    )

  const url =
    URL.createObjectURL(
      blob
    )

  const link =
    document.createElement(
      "a"
    )

  // ========================================
  // FILE NAME
  // ========================================

  let datePart =
    "all-records"

  if (
    filters.startDate ||
    filters.endDate
  ) {
    datePart =
      `${
        filters.startDate ??
        "beginning"
      }_${
        filters.endDate ??
        "latest"
      }`
  }

  link.href =
    url

  link.download =
    `barangay-reports-${datePart}.xlsx`

  document.body.appendChild(
    link
  )

  link.click()

  document.body.removeChild(
    link
  )

  URL.revokeObjectURL(
    url
  )
}