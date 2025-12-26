"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { signupWithPassword } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Car, Loader2, Wrench } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // <CHANGE> Form state management with validation
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullNameError, setFullNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // <CHANGE> Client-side validation functions
  const validateFullName = (value: string) => {
    if (!value || value.length < 2) {
      setFullNameError("Full name must be at least 2 characters")
      return false
    }
    setFullNameError("")
    return true
  }

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Invalid email address")
      return false
    }
    setEmailError("")
    return true
  }

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("Password is required")
      return false
    }
    if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return false
    }
    setPasswordError("")
    return true
  }

  // <CHANGE> Handle signup with Server Action
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const isFullNameValid = validateFullName(fullName)
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isFullNameValid || !isEmailValid || !isPasswordValid) return

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await signupWithPassword(formData)
      
      if (result.success) {
        toast.success("Account created! Please check your email to verify.")
        router.push("/auth/login")
      } else {
        toast.error(result.error || "Signup failed")
      }
    })
  }

  const isFormValid = fullName.length >= 2 && 
                      email.includes("@") && 
                      password.length >= 6 && 
                      !fullNameError && 
                      !emailError && 
                      !passwordError

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2 items-center gap-2 ">
            <div className="bg-primary p-2.5 rounded-xl">
              <Wrench className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tight uppercase text-slate-900">Mechanic Pro</h1>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">Digital Shop System</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription>Join the elite fleet of digital mechanics</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                name="fullName"
                placeholder="John Belson"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (fullNameError) validateFullName(e.target.value)
                }}
                onBlur={(e) => validateFullName(e.target.value)}
                className={fullNameError ? "border-red-500" : ""}
                disabled={isPending}
                required
              />
              {fullNameError && <p className="text-xs text-red-600 font-medium">{fullNameError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="mechanic@shop.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) validateEmail(e.target.value)
                }}
                onBlur={(e) => validateEmail(e.target.value)}
                className={emailError ? "border-red-500" : ""}
                disabled={isPending}
                required
              />
              {emailError && <p className="text-xs text-red-600 font-medium">{emailError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordError) validatePassword(e.target.value)
                }}
                onBlur={(e) => validatePassword(e.target.value)}
                className={passwordError ? "border-red-500" : ""}
                disabled={isPending}
                required
              />
              {passwordError && <p className="text-xs text-red-600 font-medium">{passwordError}</p>}
            </div>
            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={isPending || !isFormValid}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
