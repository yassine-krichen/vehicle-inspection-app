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
    console.error("[v0] Error creating inspection:", err)
    return { success: false, error: "Failed to create inspection" }
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
