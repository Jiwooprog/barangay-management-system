import { jsPDF } from "jspdf"
import QRCode from "qrcode"

import type {
  CertificateRequest,
} from "@/features/certificates/types"

import {
  getBarangaySettings,
} from "@/features/settings/services/settings.service"

import type {
  BarangaySettings,
} from "@/features/settings/types"

// ========================================
// CONSTANTS
// ========================================

const COUNTRY_NAME =
  "Republic of the Philippines"

// ========================================
// HELPERS
// ========================================

function getResidentName(
  request: CertificateRequest
) {
  const resident =
    request.residents

  if (!resident) {
    return "Unknown Resident"
  }

  return [
    resident.first_name,
    resident.middle_name,
    resident.last_name,
    resident.suffix,
  ]
    .filter(Boolean)
    .join(" ")
}

// ========================================
// LOCATION HELPERS
// ========================================

function getBarangayName(
  settings: BarangaySettings
) {
  return (
    settings.barangay_name
      ?.trim() ||
    "Barangay"
  )
}

function getMunicipalityCity(
  settings: BarangaySettings
) {
  return (
    settings.municipality_city
      ?.trim() ||
    "Municipality / City"
  )
}

function getProvince(
  settings: BarangaySettings
) {
  return (
    settings.province
      ?.trim() ||
    "Province"
  )
}

function getResidentAddress(
  request: CertificateRequest,
  settings: BarangaySettings
) {
  const resident =
    request.residents

  const barangayName =
    getBarangayName(
      settings
    )

  const municipalityCity =
    getMunicipalityCity(
      settings
    )

  const province =
    getProvince(
      settings
    )

  if (!resident) {
    return [
      barangayName,
      municipalityCity,
      province,
    ]
      .filter(Boolean)
      .join(", ")
  }

  const addressParts = [
    resident.house_number,
    resident.street,
    resident.puroks?.name,
    barangayName,
    municipalityCity,
    province,
  ].filter(Boolean)

  return addressParts.join(", ")
}

// ========================================
// DATE FORMAT
// ========================================

function formatDate(
  value: string | null
) {
  if (!value) {
    return ""
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ""
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date)
}

// ========================================
// FILE NAME
// ========================================

function sanitizeFileName(
  value: string
) {
  return value
    .replace(
      /[^a-zA-Z0-9-_ ]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
}

// ========================================
// CERTIFICATE TITLE
// ========================================

function getCertificateTitle(
  request: CertificateRequest
) {
  return (
    request.certificate_types
      ?.name ??
    "Barangay Certificate"
  ).toUpperCase()
}

// ========================================
// CERTIFICATE BODY
// ========================================

function getCertificateBody(
  request: CertificateRequest,
  settings: BarangaySettings
) {
  const residentName =
    getResidentName(
      request
    )

  const address =
    getResidentAddress(
      request,
      settings
    )

  const purpose =
    request.purpose

  const code =
    request.certificate_types
      ?.code

  switch (code) {
    case "RESIDENCY":
      return [
        "TO WHOM IT MAY CONCERN:",
        "",
        `This is to certify that ${residentName} is a bona fide resident of ${address}.`,
        "",
        `This certification is issued upon the request of the above-named person for the purpose of ${purpose}.`,
      ]

    case "INDIGENCY":
      return [
        "TO WHOM IT MAY CONCERN:",
        "",
        `This is to certify that ${residentName}, a resident of ${address}, has requested a Certificate of Indigency from this Barangay.`,
        "",
        `This certification is issued for the purpose of ${purpose}.`,
      ]

    case "BUSINESS_CLEARANCE":
      return [
        "TO WHOM IT MAY CONCERN:",
        "",
        `This is to certify that ${residentName}, a resident of ${address}, has applied for Barangay Business Clearance for the business described below.`,
        "",
        `Business Name: ${request.business_name ?? "N/A"}`,
        `Business Address: ${request.business_address ?? "N/A"}`,
        "",
        `This clearance is issued for the purpose of ${purpose}.`,
      ]

    case "GOOD_MORAL":
      return [
        "TO WHOM IT MAY CONCERN:",
        "",
        `This is to certify that ${residentName} is a resident of ${address}.`,
        "",
        `This Certificate of Good Moral Character is issued upon the resident's request for the purpose of ${purpose}.`,
      ]

    case "BARANGAY_CLEARANCE":
    default:
      return [
        "TO WHOM IT MAY CONCERN:",
        "",
        `This is to certify that ${residentName} is a bona fide resident of ${address}.`,
        "",
        `This Barangay Clearance is issued upon request for the purpose of ${purpose}.`,
      ]
  }
}

// ========================================
// GENERATE PDF
// ========================================

export async function generateCertificatePdf(
  request: CertificateRequest
): Promise<void> {
  // ======================================
  // VALIDATION
  // ======================================

  if (
    request.status !== "issued"
  ) {
    throw new Error(
      "Only issued certificates can be generated."
    )
  }

  if (
    !request.certificate_number
  ) {
    throw new Error(
      "Certificate number is missing."
    )
  }

  // ======================================
  // LOAD LIVE BARANGAY SETTINGS
  // ======================================

  let settings:
    BarangaySettings

  try {
    settings =
      await getBarangaySettings()
  } catch (settingsError) {
    console.error(
      "Unable to load barangay settings:",
      settingsError
    )

    throw new Error(
      "Unable to load barangay information for the certificate."
    )
  }

  const barangayName =
    getBarangayName(
      settings
    )

  const municipalityCity =
    getMunicipalityCity(
      settings
    )

  const provinceName =
    getProvince(
      settings
    )

  const officeAddress =
    settings.barangay_address
      ?.trim() ||
    ""

  const punongBarangayName =
    settings.punong_barangay_name
      ?.trim() ||
    ""

  const contactNumber =
    settings.contact_number
      ?.trim() ||
    ""

  const barangayEmail =
    settings.email
      ?.trim() ||
    ""

  // ======================================
  // CREATE DOCUMENT
  // ======================================

  const doc =
    new jsPDF({
      orientation:
        "portrait",
      unit:
        "mm",
      format:
        "a4",
    })

  const pageWidth =
    doc.internal.pageSize
      .getWidth()

  const pageHeight =
    doc.internal.pageSize
      .getHeight()

  const margin =
    20

  // ======================================
  // BORDER
  // ======================================

  doc.setLineWidth(
    0.6
  )

  doc.rect(
    10,
    10,
    pageWidth - 20,
    pageHeight - 20
  )

  doc.setLineWidth(
    0.2
  )

  doc.rect(
    13,
    13,
    pageWidth - 26,
    pageHeight - 26
  )

  // ======================================
  // HEADER
  // ======================================

  doc.setFont(
    "helvetica",
    "normal"
  )

  doc.setTextColor(
    0,
    0,
    0
  )

  doc.setFontSize(
    11
  )

  doc.text(
    COUNTRY_NAME,
    pageWidth / 2,
    25,
    {
      align:
        "center",
    }
  )

  doc.setFontSize(
    11
  )

  doc.text(
    provinceName,
    pageWidth / 2,
    31,
    {
      align:
        "center",
    }
  )

  doc.text(
    municipalityCity,
    pageWidth / 2,
    37,
    {
      align:
        "center",
    }
  )

  doc.setFont(
    "helvetica",
    "bold"
  )

  doc.setFontSize(
    17
  )

  doc.text(
    barangayName,
    pageWidth / 2,
    46,
    {
      align:
        "center",
    }
  )

  doc.setFontSize(
    11
  )

  doc.text(
    "OFFICE OF THE PUNONG BARANGAY",
    pageWidth / 2,
    54,
    {
      align:
        "center",
    }
  )

  // ======================================
  // OFFICE ADDRESS
  // ======================================

  let headerBottomY =
    61

  if (officeAddress) {
    doc.setFont(
      "helvetica",
      "normal"
    )

    doc.setFontSize(
      8
    )

    const wrappedAddress =
      doc.splitTextToSize(
        officeAddress,
        125
      )

    doc.text(
      wrappedAddress,
      pageWidth / 2,
      headerBottomY,
      {
        align:
          "center",
      }
    )

    headerBottomY +=
      wrappedAddress.length *
        3.5 +
      2
  }

  doc.line(
    margin,
    headerBottomY,
    pageWidth - margin,
    headerBottomY
  )

  // ======================================
  // CERTIFICATE TITLE
  // ======================================

  const certificateTitleY =
    headerBottomY + 17

  doc.setFont(
    "helvetica",
    "bold"
  )

  doc.setFontSize(
    19
  )

  doc.text(
    getCertificateTitle(
      request
    ),
    pageWidth / 2,
    certificateTitleY,
    {
      align:
        "center",
    }
  )

  // ======================================
  // BODY
  // ======================================

  const bodyLines =
    getCertificateBody(
      request,
      settings
    )

  let currentY =
    certificateTitleY + 21

  doc.setFont(
    "helvetica",
    "normal"
  )

  doc.setFontSize(
    12
  )

  for (
    const paragraph
    of bodyLines
  ) {
    if (!paragraph) {
      currentY += 6
      continue
    }

    const wrappedLines =
      doc.splitTextToSize(
        paragraph,
        pageWidth -
          margin * 2
      )

    doc.text(
      wrappedLines,
      margin,
      currentY,
      {
        align:
          "justify",
        maxWidth:
          pageWidth -
          margin * 2,
      }
    )

    currentY +=
      wrappedLines.length *
        7 +
      3
  }

  // ======================================
  // DATE ISSUED
  // ======================================

  currentY += 8

  const issuedDate =
    formatDate(
      request.issued_at
    )

  const issueLocation = [
    barangayName,
    municipalityCity,
    provinceName,
  ]
    .filter(Boolean)
    .join(", ")

  const issuedText =
    `Issued this ${
      issuedDate ||
      "__________"
    } at ${issueLocation}.`

  const wrappedIssuedText =
    doc.splitTextToSize(
      issuedText,
      pageWidth -
        margin * 2
    )

  doc.setFont(
    "helvetica",
    "normal"
  )

  doc.setFontSize(
    11
  )

  doc.text(
    wrappedIssuedText,
    margin,
    currentY
  )

  // ======================================
  // SIGNATURE
  // ======================================

  const signatureY =
    210

  const signatureCenterX =
    pageWidth - 55

  // Printed name

  if (
    punongBarangayName
  ) {
    doc.setFont(
      "helvetica",
      "bold"
    )

    doc.setFontSize(
      11
    )

    doc.text(
      punongBarangayName
        .toUpperCase(),
      signatureCenterX,
      signatureY - 5,
      {
        align:
          "center",
      }
    )
  }

  // Signature line

  doc.setLineWidth(
    0.2
  )

  doc.line(
    pageWidth - 85,
    signatureY,
    pageWidth - 25,
    signatureY
  )

  // Position

  doc.setFont(
    "helvetica",
    "bold"
  )

  doc.setFontSize(
    10
  )

  doc.text(
    "PUNONG BARANGAY",
    signatureCenterX,
    signatureY + 6,
    {
      align:
        "center",
    }
  )

  doc.setFont(
    "helvetica",
    "normal"
  )

  doc.setFontSize(
    8
  )

  doc.text(
    "Signature over printed name",
    signatureCenterX,
    signatureY + 11,
    {
      align:
        "center",
    }
  )

  // ======================================
  // QR VERIFICATION
  // ======================================

  const verificationUrl =
    `${window.location.origin}/verify/${request.verification_token}`

  const qrDataUrl =
    await QRCode.toDataURL(
      verificationUrl,
      {
        width:
          300,
        margin:
          1,
        errorCorrectionLevel:
          "M",
      }
    )

  doc.addImage(
    qrDataUrl,
    "PNG",
    margin,
    220,
    30,
    30
  )

  doc.setFontSize(
    8
  )

  doc.text(
    "Scan to verify",
    margin + 15,
    254,
    {
      align:
        "center",
    }
  )

  // ======================================
  // CERTIFICATE DETAILS
  // ======================================

  doc.setFontSize(
    9
  )

  doc.text(
    `Certificate No.: ${request.certificate_number}`,
    pageWidth - margin,
    230,
    {
      align:
        "right",
    }
  )

  doc.text(
    `Request No.: ${request.request_number}`,
    pageWidth - margin,
    236,
    {
      align:
        "right",
    }
  )

  doc.text(
    `Verification ID: ${request.verification_token}`,
    pageWidth - margin,
    242,
    {
      align:
        "right",
    }
  )

  // ======================================
  // CONTACT INFORMATION
  // ======================================

  const contactParts: string[] =
    []

  if (contactNumber) {
    contactParts.push(
      `Tel: ${contactNumber}`
    )
  }

  if (barangayEmail) {
    contactParts.push(
      `Email: ${barangayEmail}`
    )
  }

  if (
    contactParts.length >
    0
  ) {
    doc.setFont(
      "helvetica",
      "normal"
    )

    doc.setFontSize(
      7
    )

    doc.text(
      contactParts.join(
        "   |   "
      ),
      pageWidth / 2,
      pageHeight - 24,
      {
        align:
          "center",
      }
    )
  }

  // ======================================
  // FOOTER
  // ======================================

  doc.setFontSize(
    8
  )

  doc.text(
    "This document was generated by the Barangay Management System.",
    pageWidth / 2,
    pageHeight - 19,
    {
      align:
        "center",
    }
  )

  // ======================================
  // SAVE FILE
  // ======================================

  const residentName =
    sanitizeFileName(
      getResidentName(
        request
      )
    )

  const certificateNumber =
    sanitizeFileName(
      request.certificate_number
    )

  doc.save(
    `${certificateNumber}-${residentName}.pdf`
  )
}