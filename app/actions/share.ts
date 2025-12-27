"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { UUID_REGEX } from "@/lib/constants"

/**
 * Validates UUID format
 */
function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid)
}

export async function togglePublishStatus(inspectionId: string, status: boolean) {
  try {
    // Input validation
    if (!isValidUUID(inspectionId)) {
      return { success: false, error: "Invalid inspection ID format" }
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Verify ownership
    const { data: inspection } = await supabase
      .from("inspections")
      .select("user_id")
      .eq("id", inspectionId)
      .single()

    if (!inspection || inspection.user_id !== user.id) {
      return { success: false, error: "Not authorized to modify this inspection" }
    }

    const { error } = await supabase
      .from("inspections")
      .update({ is_published: status })
      .eq("id", inspectionId)

    if (error) return { success: false, error: error.message }

    revalidatePath(`/protected/reports/${inspectionId}`)
    return { success: true }
  } catch (err) {
    console.error("Error toggling publish status:", err)
    return { success: false, error: "Failed to update publish status" }
  }
}

export async function rotateShareToken(inspectionId: string) {
  try {
    // Input validation
    if (!isValidUUID(inspectionId)) {
      return { success: false, error: "Invalid inspection ID format" }
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Verify ownership
    const { data: inspection } = await supabase
      .from("inspections")
      .select("user_id")
      .eq("id", inspectionId)
      .single()

    if (!inspection || inspection.user_id !== user.id) {
      return { success: false, error: "Not authorized to modify this inspection" }
    }

    // Generate new UUID by calling function with user_id for authorization
    const { data, error } = await supabase.rpc("rotate_share_token", { 
      inspection_id: inspectionId,
      requesting_user_id: user.id 
    })

    if (error) return { success: false, error: error.message }

    revalidatePath(`/protected/reports/${inspectionId}`)
    return { success: true, newToken: data }
  } catch (err) {
    console.error("Error rotating share token:", err)
    return { success: false, error: "Failed to rotate share token" }
  }
}

export async function getPublicInspection(shareToken: string) {
  try {
    // Input validation
    if (!isValidUUID(shareToken)) {
      return { success: false, error: "Invalid share token format" }
    }

    const supabase = await createClient()

    const { data: inspection, error } = await supabase
      .from("inspections")
      .select(
        `
      *,
      vehicles (*),
      inspection_results (*)
    `,
      )
      .eq("share_token", shareToken)
      .eq("is_published", true)
      .single()

    if (error || !inspection) {
      return { success: false, error: "Inspection not found or not published" }
    }

    return { success: true, data: inspection }
  } catch (err) {
    console.error("Error fetching public inspection:", err)
    return { success: false, error: "Failed to fetch inspection" }
  }
}
