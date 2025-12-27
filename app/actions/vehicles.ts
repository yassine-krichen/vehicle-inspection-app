"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const vehicleSchema = z.object({
  customer_name: z.string().min(2, "Name is too short"),
  customer_email: z.string().email("Invalid email"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  vin: z.string().optional(),
  license_plate: z.string().optional(),
})

export async function createVehicle(formData: z.infer<typeof vehicleSchema>) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const validated = vehicleSchema.safeParse(formData)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        ...validated.data,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath("/protected/clients")
    return { success: true, data }
  } catch (err) {
    console.error("Error creating vehicle:", err)
    return { success: false, error: "Failed to create vehicle" }
  }
}

export async function getVehicles() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}
