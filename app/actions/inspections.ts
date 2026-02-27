"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type InspectionStatus = "green" | "yellow" | "red" | "na" | "draft" | "completed"

export interface InspectionItemResult {
  category: string
  item_name: string
  status: InspectionStatus
  measurement?: string
  notes?: string
}

export async function createInspection(
  vehicleId: string,
  odometer: number,
  results: InspectionItemResult[],
  notes?: string,
  status: "draft" | "completed" = "completed", // Added status parameter
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Create the main inspection record
    const { data: inspection, error: inspectionError } = await supabase
      .from("inspections")
      .insert({
        vehicle_id: vehicleId,
        user_id: user.id,
        odometer,
        notes,
        status, // Use provided status
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (inspectionError) return { success: false, error: inspectionError.message }

    // 2. Insert all the individual check results
    const resultsToInsert = results.map((res) => ({
      inspection_id: inspection.id,
      category: res.category,
      item_name: res.item_name,
      status: res.status,
      measurement: res.measurement,
      notes: res.notes,
    }))

    const { error: resultsError } = await supabase.from("inspection_results").insert(resultsToInsert)

    if (resultsError) return { success: false, error: resultsError.message }

    revalidatePath("/")
    revalidatePath("/protected/inspections")

    return { success: true, id: inspection.id }
  } catch (err) {
    console.error("Error creating inspection:", err)
    return { success: false, error: "Failed to create inspection" }
  }
}

export async function getInspectionForEdit(inspectionId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false as const, error: "Unauthorized" }

  const { data: inspection, error } = await supabase
    .from("inspections")
    .select(`
      *,
      vehicles (*),
      inspection_results (*)
    `)
    .eq("id", inspectionId)
    .eq("user_id", user.id)
    .single()

  if (error || !inspection) {
    return { success: false as const, error: "Inspection not found" }
  }

  if (inspection.status !== "draft") {
    return { success: false as const, error: "Only draft inspections can be edited" }
  }

  return { success: true as const, data: inspection }
}

export async function updateInspection(
  inspectionId: string,
  odometer: number,
  results: InspectionItemResult[],
  notes?: string,
  status: "draft" | "completed" = "draft",
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Verify the inspection exists, belongs to this user, and is still a draft
    const { data: existing, error: fetchError } = await supabase
      .from("inspections")
      .select("id, status, user_id")
      .eq("id", inspectionId)
      .single()

    if (fetchError || !existing) return { success: false, error: "Inspection not found" }
    if (existing.user_id !== user.id) return { success: false, error: "Unauthorized" }
    if (existing.status !== "draft") return { success: false, error: "Only draft inspections can be edited" }

    // Update the main inspection record
    const { error: updateError } = await supabase
      .from("inspections")
      .update({
        odometer,
        notes,
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", inspectionId)

    if (updateError) return { success: false, error: updateError.message }

    // Delete old results and insert new ones
    const { error: deleteResultsError } = await supabase
      .from("inspection_results")
      .delete()
      .eq("inspection_id", inspectionId)

    if (deleteResultsError) return { success: false, error: deleteResultsError.message }

    const resultsToInsert = results.map((res) => ({
      inspection_id: inspectionId,
      category: res.category,
      item_name: res.item_name,
      status: res.status,
      measurement: res.measurement,
      notes: res.notes,
    }))

    const { error: insertError } = await supabase.from("inspection_results").insert(resultsToInsert)

    if (insertError) return { success: false, error: insertError.message }

    revalidatePath("/")
    revalidatePath("/protected/reports")
    revalidatePath(`/protected/reports/${inspectionId}`)

    return { success: true, id: inspectionId }
  } catch (err) {
    console.error("Error updating inspection:", err)
    return { success: false, error: "Failed to update inspection" }
  }
}

export async function completeInspection(inspectionId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Verify ownership and draft status
    const { data: existing, error: fetchError } = await supabase
      .from("inspections")
      .select("id, status, user_id")
      .eq("id", inspectionId)
      .single()

    if (fetchError || !existing) return { success: false, error: "Inspection not found" }
    if (existing.user_id !== user.id) return { success: false, error: "Unauthorized" }
    if (existing.status !== "draft") return { success: false, error: "Only draft inspections can be completed" }

    const { error: updateError } = await supabase
      .from("inspections")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", inspectionId)

    if (updateError) return { success: false, error: updateError.message }

    revalidatePath("/")
    revalidatePath("/protected/reports")
    revalidatePath(`/protected/reports/${inspectionId}`)

    return { success: true }
  } catch (err) {
    console.error("Error completing inspection:", err)
    return { success: false, error: "Failed to complete inspection" }
  }
}

export async function deleteInspection(inspectionId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from("inspections")
      .select("id, user_id")
      .eq("id", inspectionId)
      .single()

    if (fetchError || !existing) return { success: false, error: "Inspection not found" }
    if (existing.user_id !== user.id) return { success: false, error: "Unauthorized" }

    // inspection_results will cascade delete
    const { error: deleteError } = await supabase
      .from("inspections")
      .delete()
      .eq("id", inspectionId)

    if (deleteError) return { success: false, error: deleteError.message }

    revalidatePath("/")
    revalidatePath("/protected/reports")

    return { success: true }
  } catch (err) {
    console.error("Error deleting inspection:", err)
    return { success: false, error: "Failed to delete inspection" }
  }
}

export async function getRecentInspections() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("inspections")
    .select(`
      id,
      created_at,
      status,
      odometer,
      vehicles (
        make,
        model,
        year,
        customer_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) throw error
  return data
}
