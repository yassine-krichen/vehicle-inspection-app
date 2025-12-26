"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { loginWithPassword, loginWithMagicLink } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Car, Loader2, Wrench } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // <CHANGE> Form state management
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // <CHANGE> Client-side validation
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

  // <CHANGE> Handle password login with Server Action
  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) return

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await loginWithPassword(formData)
      
      if (result.success) {
        toast.success("Welcome back!")
        router.push("/")
        router.refresh()
      } else {
        toast.error(result.error || "Login failed")
      }
    })
  }

  // <CHANGE> Handle magic link with Server Action
  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const isEmailValid = validateEmail(email)
    if (!isEmailValid) return

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await loginWithMagicLink(formData)
      
      if (result.success) {
        toast.success("Check your email for the login link!")
      } else {
        toast.error(result.error || "Failed to send magic link")
      }
    })
  }

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
          <CardDescription>Enter your credentials to access your shop</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                  disabled={isPending || !!emailError || !!passwordError || !email || !password}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="magic">
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email</Label>
                  <Input
                    id="magic-email"
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
                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={isPending || !!emailError || !email}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Magic Link...
                    </>
                  ) : (
                    "Send Link"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-bold text-primary hover:underline">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
