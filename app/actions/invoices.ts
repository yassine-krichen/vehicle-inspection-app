"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface InvoiceSection {
  id?: string
  title: string
  sort_order: number
  items: InvoiceItem[]
}

export interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  sort_order: number
}

export interface CreateInvoiceInput {
  customer_name: string
  customer_email?: string
  vehicle_info?: string
  inspection_id?: string
  notes?: string
  tax_rate: number
  sections: InvoiceSection[]
}

export async function createInvoice(input: CreateInvoiceInput) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Calculate totals
    const subtotal = input.sections.reduce(
      (sum, section) => sum + section.items.reduce((s, item) => s + item.amount, 0),
      0,
    )
    const taxAmount = subtotal * (input.tax_rate / 100)
    const total = subtotal + taxAmount

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        customer_name: input.customer_name,
        customer_email: input.customer_email || null,
        vehicle_info: input.vehicle_info || null,
        inspection_id: input.inspection_id || null,
        notes: input.notes || null,
        tax_rate: input.tax_rate,
        subtotal,
        tax_amount: taxAmount,
        total,
        status: "draft",
      })
      .select()
      .single()

    if (invoiceError) return { success: false, error: invoiceError.message }

    // Create sections and items
    for (const section of input.sections) {
      const { data: sectionData, error: sectionError } = await supabase
        .from("invoice_sections")
        .insert({
          invoice_id: invoice.id,
          title: section.title,
          sort_order: section.sort_order,
        })
        .select()
        .single()

      if (sectionError) return { success: false, error: sectionError.message }

      if (section.items.length > 0) {
        const itemsToInsert = section.items.map((item) => ({
          section_id: sectionData.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount,
          sort_order: item.sort_order,
        }))

        const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert)

        if (itemsError) return { success: false, error: itemsError.message }
      }
    }

    revalidatePath("/protected/invoices")
    revalidatePath("/")

    return { success: true, id: invoice.id }
  } catch (err) {
    console.error("Error creating invoice:", err)
    return { success: false, error: "Failed to create invoice" }
  }
}

export async function getInvoices() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getInvoice(invoiceId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single()

  if (invoiceError || !invoice) return null

  // Fetch sections with items
  const { data: sections, error: sectionsError } = await supabase
    .from("invoice_sections")
    .select(`
      *,
      invoice_items (*)
    `)
    .eq("invoice_id", invoiceId)
    .order("sort_order", { ascending: true })

  if (sectionsError) return null

  // Sort items within each section
  const sortedSections = sections.map((section: { invoice_items: { sort_order: number }[] }) => ({
    ...section,
    invoice_items: section.invoice_items.sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
  }))

  return { ...invoice, sections: sortedSections }
}

export async function updateInvoiceStatus(invoiceId: string, status: "draft" | "sent" | "paid") {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { error } = await supabase
      .from("invoices")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", invoiceId)
      .eq("user_id", user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath("/protected/invoices")
    revalidatePath(`/protected/invoices/${invoiceId}`)

    return { success: true }
  } catch (err) {
    console.error("Error updating invoice status:", err)
    return { success: false, error: "Failed to update invoice status" }
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Cascade will handle sections and items
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId)
      .eq("user_id", user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath("/protected/invoices")
    revalidatePath("/")

    return { success: true }
  } catch (err) {
    console.error("Error deleting invoice:", err)
    return { success: false, error: "Failed to delete invoice" }
  }
}
