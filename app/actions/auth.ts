"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"

// <CHANGE> Zod validation schemas for auth forms
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
})

const magicLinkSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// <CHANGE> Server Action for password login
export async function loginWithPassword(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Validate input
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      return { success: false, error: result.error.errors[0].message }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// <CHANGE> Server Action for signup
export async function signupWithPassword(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    // Validate input
    const result = signupSchema.safeParse({ email, password, fullName })
    if (!result.success) {
      return { success: false, error: result.error.errors[0].message }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: { full_name: result.data.fullName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// <CHANGE> Server Action for magic link
export async function loginWithMagicLink(formData: FormData) {
  try {
    const email = formData.get("email") as string

    // Validate input
    const result = magicLinkSchema.safeParse({ email })
    if (!result.success) {
      return { success: false, error: result.error.errors[0].message }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: result.data.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Magic link error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// <CHANGE> Server Action for logout
export async function logout() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
