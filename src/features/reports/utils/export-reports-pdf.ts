import {
  jsPDF,
} from "jspdf"

import type {
  BlotterReportRow,
  CertificateReportRow,
  ReportFilters,
  ReportsSummary,
} from "@/features/reports/types"

// ========================================
// TYPES
// ========================================

interface ExportReportsPdfInput {
  summary: ReportsSummary

  certificates:
    CertificateReportRow[]

  blotter:
    BlotterReportRow[]

  filters:
    ReportFilters
}

interface PdfColumn {
  title: string
  width: number
}

// ========================================
// CONSTANTS
// ========================================

const margin = 14

const pageWidth = 297
const pageHeight = 210

const contentWidth =
  pageWidth -
  margin * 2

// ========================================
// HELPERS
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
// PAGE HEADER
// ========================================

function drawPageHeader(
  doc: jsPDF,
  title = "Barangay Management System - Reports"
) {
  doc.setFont(
    "helvetica",
    "bold"
  )

  doc.setFontSize(
    16
  )

  doc.text(
    title,
    margin,
    15
  )

  doc.setDrawColor(
    180
  )

  doc.line(
    margin,
    19,
    pageWidth -
      margin,
    19
  )
}

// ========================================
// NEW PAGE
// ========================================

function addNewPage(
  doc: jsPDF,
  title?: string
) {
  doc.addPage()

  drawPageHeader(
    doc,
    title
  )

  return 27
}

// ========================================
// CHECK AVAILABLE SPACE
// ========================================

function ensureSpace(
  doc: jsPDF,
  y: number,
  neededHeight: number,
  title?: string
) {
  if (
    y +
      neededHeight >
    pageHeight - 18
  ) {
    return addNewPage(
      doc,
      title
    )
  }

  return y
}

// ========================================
// SECTION TITLE
// ========================================

function drawSectionTitle(
  doc: jsPDF,
  title: string,
  y: number
) {
  y = ensureSpace(
    doc,
    y,
    12
  )

  doc.setFillColor(
    235,
    235,
    235
  )

  doc.rect(
    margin,
    y,
    contentWidth,
    9,
    "F"
  )

  doc.setFont(
    "helvetica",
    "bold"
  )

  doc.setFontSize(
    11
  )

  doc.text(
    title,
    margin + 3,
    y + 6
  )

  return y + 13
}

// ========================================
// SUMMARY ROW
// ========================================

function drawSummaryRow(
  doc: jsPDF,
  label: string,
  value:
    | string
    | number,
  y: number
) {
  y = ensureSpace(
    doc,
    y,
    7
  )

  doc.setFont(
    "helvetica",
    "normal"
  )

  doc.setFontSize(
    9
  )

  doc.text(
    label,
    margin + 3,
    y
  )

  doc.setFont(
    "helvetica",
    "bold"
  )

  doc.text(
    String(value),
    margin + 80,
    y
  )

  return y + 6
}

// ========================================
// TABLE
// ========================================

function drawTable(
  doc: jsPDF,
  {
    title,
    columns,
    rows,
    startY,
  }: {
    title: string

    columns:
      PdfColumn[]

    rows:
      string[][]

    startY: number
  }
) {
  let y =
    drawSectionTitle(
      doc,
      title,
      startY
    )

  // ========================================
  // TABLE HEADER
  // ========================================

  const drawHeader =
    () => {
      let x =
        margin

      doc.setFillColor(
        40,
        40,
        40
      )

      doc.rect(
        margin,
        y,
        columns.reduce(
          (
            total,
            column
          ) =>
            total +
            column.width,
          0
        ),
        9,
        "F"
      )

      doc.setFont(
        "helvetica",
        "bold"
      )

      doc.setTextColor(
        255,
        255,
        255
      )

      doc.setFontSize(
        8
      )

      columns.forEach(
        (column) => {
          doc.text(
            column.title,
            x + 2,
            y + 6
          )

          x +=
            column.width
        }
      )

      doc.setTextColor(
        0,
        0,
        0
      )

      y += 9
    }

  drawHeader()

  // ========================================
  // EMPTY TABLE
  // ========================================

  if (
    rows.length === 0
  ) {
    doc.setFont(
      "helvetica",
      "italic"
    )

    doc.setFontSize(
      8
    )

    doc.text(
      "No records found.",
      margin + 2,
      y + 7
    )

    return y + 13
  }

  // ========================================
  // TABLE ROWS
  // ========================================

  for (
    const row of rows
  ) {
    const wrappedCells =
      row.map(
        (
          value,
          index
        ) =>
          doc.splitTextToSize(
            value ||
              "—",
            columns[index]
              .width -
              4
          ) as string[]
      )

    const lineCount =
      Math.max(
        ...wrappedCells.map(
          (cell) =>
            cell.length
        )
      )

    const rowHeight =
      Math.max(
        8,
        lineCount * 4 + 3
      )

    if (
      y +
        rowHeight >
      pageHeight - 18
    ) {
      y =
        addNewPage(
          doc,
          title
        )

      drawHeader()
    }

    let x =
      margin

    wrappedCells.forEach(
      (
        cellLines,
        index
      ) => {
        doc.setDrawColor(
          210
        )

        doc.rect(
          x,
          y,
          columns[index]
            .width,
          rowHeight
        )

        doc.setFont(
          "helvetica",
          "normal"
        )

        doc.setFontSize(
          8
        )

        doc.text(
          cellLines,
          x + 2,
          y + 5
        )

        x +=
          columns[index]
            .width
      }
    )

    y +=
      rowHeight
  }

  return y + 5
}

// ========================================
// MAIN EXPORT
// ========================================

export async function exportReportsPdf({
  summary,
  certificates,
  blotter,
  filters,
}: ExportReportsPdfInput) {
  const doc =
    new jsPDF({
      orientation:
        "landscape",

      unit:
        "mm",

      format:
        "a4",
    })

  drawPageHeader(
    doc
  )

  let y =
    28

  // ========================================
  // REPORT INFORMATION
  // ========================================

  doc.setFont(
    "helvetica",
    "normal"
  )

  doc.setFontSize(
    9
  )

  doc.text(
    "Report Period:",
    margin,
    y
  )

  doc.setFont(
    "helvetica",
    "bold"
  )

  doc.text(
    getReportPeriod(
      filters
    ),
    margin + 28,
    y
  )

  y += 6

  doc.setFont(
    "helvetica",
    "normal"
  )

  doc.text(
    "Generated:",
    margin,
    y
  )

  doc.setFont(
    "helvetica",
    "bold"
  )

  doc.text(
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
    margin + 28,
    y
  )

  y += 10

  // ========================================
  // POPULATION
  // ========================================

  y =
    drawSectionTitle(
      doc,
      "Population Snapshot",
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Residents",
      summary.population
        .residents,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Households",
      summary.population
        .households,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Puroks",
      summary.population
        .puroks,
      y
    )

  y += 4

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

  y =
    drawSectionTitle(
      doc,
      "Certificate Requests - Selected Period",
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Total Requests",
      certificateCounts.total,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Pending",
      certificateCounts.pending,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Approved",
      certificateCounts.approved,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Issued",
      certificateCounts.issued,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Rejected",
      certificateCounts.rejected,
      y
    )

  // ========================================
  // CERTIFICATE TABLE
  // ========================================

  y += 4

  y =
    drawTable(
      doc,
      {
        title:
          "Certificate Request Report",

        columns: [
          {
            title:
              "Request #",

            width:
              60,
          },

          {
            title:
              "Date",

            width:
              50,
          },

          {
            title:
              "Status",

            width:
              45,
          },
        ],

        rows:
          certificates.map(
            (item) => [
              item.request_number,

              formatDate(
                item.created_at
              ),

              formatLabel(
                item.status
              ),
            ]
          ),

        startY:
          y,
      }
    )

  // ========================================
  // BLOTTER COUNTS
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

    urgent:
      blotter.filter(
        (item) =>
          item.priority ===
          "urgent"
      ).length,

    high:
      blotter.filter(
        (item) =>
          item.priority ===
          "high"
      ).length,
  }

  y =
    ensureSpace(
      doc,
      y,
      65,
      "Peace & Order Report"
    )

  y =
    drawSectionTitle(
      doc,
      "Peace & Order - Selected Period",
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Total Cases",
      blotterCounts.total,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Open",
      blotterCounts.open,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Under Mediation",
      blotterCounts.underMediation,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Settled",
      blotterCounts.settled,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Referred",
      blotterCounts.referred,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Dismissed",
      blotterCounts.dismissed,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Closed",
      blotterCounts.closed,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "Urgent Priority",
      blotterCounts.urgent,
      y
    )

  y =
    drawSummaryRow(
      doc,
      "High Priority",
      blotterCounts.high,
      y
    )

  // ========================================
  // PEACE & ORDER TABLE
  // ========================================

  y += 4

  drawTable(
    doc,
    {
      title:
        "Peace & Order Case Report",

      columns: [
        {
          title:
            "Case #",

          width:
            48,
        },

        {
          title:
            "Complaint",

          width:
            90,
        },

        {
          title:
            "Incident Date",

          width:
            42,
        },

        {
          title:
            "Priority",

          width:
            35,
        },

        {
          title:
            "Status",

          width:
            50,
        },
      ],

      rows:
        blotter.map(
          (item) => [
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
          ]
        ),

      startY:
        y,
    }
  )

  // ========================================
  // FOOTERS / PAGE NUMBERS
  // ========================================

  const totalPages =
    doc.getNumberOfPages()

  for (
    let page = 1;
    page <= totalPages;
    page += 1
  ) {
    doc.setPage(
      page
    )

    doc.setDrawColor(
      210
    )

    doc.line(
      margin,
      pageHeight - 12,
      pageWidth -
        margin,
      pageHeight - 12
    )

    doc.setFont(
      "helvetica",
      "normal"
    )

    doc.setFontSize(
      7
    )

    doc.setTextColor(
      90
    )

    doc.text(
      "Generated by Barangay Management System",
      margin,
      pageHeight - 7
    )

    doc.text(
      `Page ${page} of ${totalPages}`,
      pageWidth -
        margin,
      pageHeight - 7,
      {
        align:
          "right",
      }
    )
  }

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

  doc.save(
    `barangay-reports-${datePart}.pdf`
  )
}