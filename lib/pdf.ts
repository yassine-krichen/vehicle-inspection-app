import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// ─── Shared Helpers ───────────────────────────────────────────────

const COLORS = {
  primary: [15, 23, 42] as [number, number, number], // slate-900
  accent: [59, 130, 246] as [number, number, number], // blue-500
  green: [34, 197, 94] as [number, number, number],
  yellow: [234, 179, 8] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
}

function statusLabel(s: string): string {
  switch (s) {
    case "green": return "OK"
    case "yellow": return "CAUTION"
    case "red": return "CRITICAL"
    case "na": return "N/A"
    default: return s.toUpperCase()
  }
}

function statusColor(s: string): [number, number, number] {
  switch (s) {
    case "green": return COLORS.green
    case "yellow": return COLORS.yellow
    case "red": return COLORS.red
    default: return COLORS.gray
  }
}

function addHeader(doc: jsPDF, title: string, subtitle: string, rightText: string, rightSub: string) {
  // Dark header bar
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, 210, 28, "F")

  // Accent stripe
  doc.setFillColor(...COLORS.accent)
  doc.rect(0, 28, 210, 1.5, "F")

  // Title
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(title, 14, 12)

  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.text(subtitle, 14, 18)

  // Right side
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(rightText, 196, 12, { align: "right" })

  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.text(rightSub, 196, 18, { align: "right" })
}

function addInfoRow(doc: jsPDF, y: number, items: { label: string; value: string }[]) {
  doc.setFillColor(...COLORS.lightGray)
  doc.roundedRect(14, y, 182, 14, 2, 2, "F")

  const colWidth = 182 / items.length
  items.forEach((item, i) => {
    const x = 14 + i * colWidth + 4
    doc.setFontSize(6)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.gray)
    doc.text(item.label.toUpperCase(), x, y + 5)

    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...COLORS.black)
    doc.text(item.value, x, y + 11)
  })
}

function addFooter(doc: jsPDF) {
  const pageH = doc.internal.pageSize.getHeight()
  doc.setFontSize(6)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...COLORS.gray)
  doc.text("Mechanic Pro — Digital Shop System", 105, pageH - 6, { align: "center" })
}

// ─── Inspection PDF ───────────────────────────────────────────────

interface InspectionPDFData {
  id: string
  created_at: string
  odometer: number
  notes: string | null
  status: string
  vehicles: {
    year: number
    make: string
    model: string
    vin: string | null
    customer_name: string
  }
  inspection_results: {
    category: string
    item_name: string
    status: string
    measurement: string | null
    notes: string | null
  }[]
}

export function generateInspectionPDF(inspection: InspectionPDFData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const vehicle = inspection.vehicles
  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`

  // Header
  addHeader(
    doc,
    "MECHANIC PRO",
    "CERTIFIED MULTI-POINT INSPECTION REPORT",
    vehicleName,
    `VIN: ${vehicle.vin || "N/A"}`,
  )

  // Info row
  const infoItems = [
    { label: "Customer", value: vehicle.customer_name },
    { label: "Date", value: new Date(inspection.created_at).toLocaleDateString() },
    { label: "Odometer", value: `${inspection.odometer?.toLocaleString() || "—"} MI` },
    { label: "Status", value: inspection.status.toUpperCase() },
  ]
  addInfoRow(doc, 34, infoItems)

  // Summary counts
  const redCount = inspection.inspection_results.filter((r) => r.status === "red").length
  const yellowCount = inspection.inspection_results.filter((r) => r.status === "yellow").length
  const greenCount = inspection.inspection_results.filter((r) => r.status === "green").length

  let y = 54

  // Summary badges
  if (redCount > 0 || yellowCount > 0) {
    const badges = [
      { label: "CRITICAL", count: redCount, color: COLORS.red },
      { label: "CAUTION", count: yellowCount, color: COLORS.yellow },
      { label: "PASSED", count: greenCount, color: COLORS.green },
    ]

    badges.forEach((badge, i) => {
      const bx = 14 + i * 62
      doc.setFillColor(...badge.color)
      doc.roundedRect(bx, y, 58, 8, 1.5, 1.5, "F")
      doc.setTextColor(...COLORS.white)
      if (badge.color === COLORS.yellow) doc.setTextColor(...COLORS.black)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.text(`${badge.count} ${badge.label}`, bx + 29, y + 5.5, { align: "center" })
    })
    y += 13
  }

  // Group results by category
  const byCategory: Record<string, typeof inspection.inspection_results> = {}
  inspection.inspection_results.forEach((r) => {
    if (!byCategory[r.category]) byCategory[r.category] = []
    byCategory[r.category].push(r)
  })

  // Build table data per category
  Object.entries(byCategory).forEach(([category, items]) => {
    // Check if we need a new page
    const estimatedHeight = 8 + items.length * 6
    if (y + estimatedHeight > 275) {
      doc.addPage()
      y = 14
    }

    // Category header
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...COLORS.primary)
    doc.text(category.toUpperCase(), 14, y + 4)
    doc.setDrawColor(...COLORS.primary)
    doc.setLineWidth(0.5)
    doc.line(14, y + 6, 196, y + 6)
    y += 9

    // Items table
    const tableBody = items.map((item) => [
      item.item_name,
      item.measurement || "—",
      statusLabel(item.status),
    ])

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [["Item", "Measurement", "Status"]],
      body: tableBody,
      theme: "plain",
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        textColor: COLORS.black,
        lineWidth: 0,
      },
      headStyles: {
        fontSize: 6,
        fontStyle: "bold",
        textColor: COLORS.gray,
        fillColor: [255, 255, 255] as [number, number, number],
        cellPadding: { top: 1, bottom: 2, left: 1.5, right: 1.5 },
      },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 35, halign: "center" },
        2: { cellWidth: 30, halign: "center", fontStyle: "bold" },
      },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 2) {
          const val = data.cell.raw as string
          if (val === "CRITICAL") data.cell.styles.textColor = COLORS.red
          else if (val === "CAUTION") data.cell.styles.textColor = COLORS.yellow
          else if (val === "OK") data.cell.styles.textColor = COLORS.green
          else data.cell.styles.textColor = COLORS.gray
        }
      },
      didDrawPage() {
        addFooter(doc)
      },
    })

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4
  })

  // Notes section
  if (inspection.notes) {
    if (y + 20 > 275) {
      doc.addPage()
      y = 14
    }
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...COLORS.primary)
    doc.text("NOTES", 14, y + 4)
    y += 8

    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.black)
    const lines = doc.splitTextToSize(inspection.notes, 178)
    doc.text(lines, 14, y)
    y += lines.length * 3.5
  }

  addFooter(doc)

  doc.save(`inspection-${vehicleName.replace(/\s+/g, "-").toLowerCase()}-${new Date(inspection.created_at).toISOString().slice(0, 10)}.pdf`)
}

// ─── Invoice PDF ──────────────────────────────────────────────────

interface InvoicePDFSection {
  id: string
  title: string
  invoice_items: {
    id: string
    description: string
    quantity: number
    unit_price: number
    amount: number
  }[]
}

interface InvoicePDFData {
  id: string
  invoice_number: string
  customer_name: string
  customer_email: string | null
  vehicle_info: string | null
  status: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes: string | null
  created_at: string
  sections: InvoicePDFSection[]
}

export function generateInvoicePDF(invoice: InvoicePDFData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })

  // Header
  addHeader(
    doc,
    "MECHANIC PRO",
    "SERVICE INVOICE",
    invoice.invoice_number,
    new Date(invoice.created_at).toLocaleDateString(),
  )

  // Info row
  const infoItems: { label: string; value: string }[] = [
    { label: "Customer", value: invoice.customer_name },
    { label: "Date", value: new Date(invoice.created_at).toLocaleDateString() },
  ]
  if (invoice.vehicle_info) {
    infoItems.push({ label: "Vehicle", value: invoice.vehicle_info })
  }
  infoItems.push({ label: "Status", value: invoice.status.toUpperCase() })

  addInfoRow(doc, 34, infoItems)

  let y = 54

  // Sections with items
  if (invoice.sections && invoice.sections.length > 0) {
    invoice.sections.forEach((section) => {
      const estimatedHeight = 10 + section.invoice_items.length * 6
      if (y + estimatedHeight > 255) {
        doc.addPage()
        y = 14
      }

      // Section header
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.primary)
      doc.text(section.title.toUpperCase(), 14, y + 4)
      doc.setDrawColor(...COLORS.primary)
      doc.setLineWidth(0.5)
      doc.line(14, y + 6, 196, y + 6)
      y += 9

      const tableBody = section.invoice_items.map((item) => [
        item.description,
        Number(item.quantity).toString(),
        `$${Number(item.unit_price).toFixed(2)}`,
        `$${Number(item.amount).toFixed(2)}`,
      ])

      autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        head: [["Description", "Qty", "Unit Price", "Amount"]],
        body: tableBody,
        theme: "plain",
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
          textColor: COLORS.black,
          lineWidth: 0,
        },
        headStyles: {
          fontSize: 6,
          fontStyle: "bold",
          textColor: COLORS.gray,
          fillColor: [255, 255, 255] as [number, number, number],
          cellPadding: { top: 1, bottom: 2, left: 1.5, right: 1.5 },
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 30, halign: "right" },
          3: { cellWidth: 27, halign: "right", fontStyle: "bold" },
        },
        didDrawPage() {
          addFooter(doc)
        },
      })

      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4
    })
  }

  // Totals
  if (y + 30 > 275) {
    doc.addPage()
    y = 14
  }

  const totalsX = 130
  const valX = 196

  doc.setDrawColor(...COLORS.primary)
  doc.setLineWidth(0.3)
  doc.line(totalsX, y, valX, y)
  y += 5

  // Subtotal
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...COLORS.gray)
  doc.text("SUBTOTAL", totalsX, y)
  doc.setTextColor(...COLORS.black)
  doc.setFont("helvetica", "bold")
  doc.text(`$${Number(invoice.subtotal).toFixed(2)}`, valX, y, { align: "right" })
  y += 5

  // Tax
  if (Number(invoice.tax_rate) > 0) {
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.gray)
    doc.text(`TAX (${Number(invoice.tax_rate)}%)`, totalsX, y)
    doc.setTextColor(...COLORS.black)
    doc.text(`$${Number(invoice.tax_amount).toFixed(2)}`, valX, y, { align: "right" })
    y += 5
  }

  // Total
  doc.setDrawColor(...COLORS.primary)
  doc.setLineWidth(0.8)
  doc.line(totalsX, y, valX, y)
  y += 6

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text("TOTAL DUE", totalsX, y)
  doc.setFontSize(12)
  doc.text(`$${Number(invoice.total).toFixed(2)}`, valX, y, { align: "right" })
  y += 8

  // Notes
  if (invoice.notes) {
    if (y + 20 > 275) {
      doc.addPage()
      y = 14
    }

    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...COLORS.primary)
    doc.text("NOTES", 14, y + 4)
    y += 8

    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.black)
    const lines = doc.splitTextToSize(invoice.notes, 178)
    doc.text(lines, 14, y)
    y += lines.length * 3.5
  }

  // Thank you
  y += 6
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.gray)
  doc.text("Thank you for your business.", 105, y, { align: "center" })

  addFooter(doc)

  doc.save(`invoice-${invoice.invoice_number.toLowerCase()}-${new Date(invoice.created_at).toISOString().slice(0, 10)}.pdf`)
}
