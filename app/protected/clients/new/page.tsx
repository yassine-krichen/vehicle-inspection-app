"use client"

import { useSearchParams } from "next/navigation"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createVehicle } from "@/app/actions/vehicles"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { User, Car, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"

export default function NewClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const prefilledEmail = searchParams.get("email") || ""
  const prefilledName = searchParams.get("name") || ""
  const isAddingToExisting = !!prefilledEmail

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      customer_name: formData.get("customer_name") as string,
      customer_email: formData.get("customer_email") as string,
      make: formData.get("make") as string,
      model: formData.get("model") as string,
      year: Number.parseInt(formData.get("year") as string),
      vin: formData.get("vin") as string,
      license_plate: formData.get("license_plate") as string,
    }

    try {
      const res = await createVehicle(data)
      if (res.success) {
        toast.success(isAddingToExisting ? "Vehicle added successfully!" : "Client and vehicle added successfully!")
        router.push(isAddingToExisting ? `/protected/clients/${prefilledEmail}` : "/protected/clients")
      } else {
        toast.error(res.error || "Failed to add client. Please check your entries.")
      }
    } catch (err) {
      console.error("Error creating vehicle:", err)
      toast.error("Failed to add client. Please check your entries.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <AppHeader title={isAddingToExisting ? "Add Vehicle" : "Add New Client"} />

      <main className="flex-1 max-w-3xl mx-auto w-full p-6">
        {isAddingToExisting && (
          <Button variant="ghost" asChild className="mb-6">
            <Link href={`/protected/clients/${prefilledEmail}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Client
            </Link>
          </Button>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Customer Information</CardTitle>
              </div>
              <CardDescription>
                {isAddingToExisting ? "Adding vehicle for an existing customer" : "Enter the owner's contact details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Full Name</Label>
                  <Input
                    id="customer_name"
                    name="customer_name"
                    placeholder="John Belson"
                    required
                    defaultValue={prefilledName}
                    readOnly={isAddingToExisting}
                    className={isAddingToExisting ? "bg-slate-50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_email">Email Address</Label>
                  <Input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    defaultValue={prefilledEmail}
                    readOnly={isAddingToExisting}
                    className={isAddingToExisting ? "bg-slate-50" : ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-5 w-5 text-primary" />
                <CardTitle>Vehicle Details</CardTitle>
              </div>
              <CardDescription>Specify the vehicle being inspected</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" name="year" type="number" placeholder="2024" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" name="make" placeholder="BMW" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" name="model" placeholder="X5" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN (Optional)</Label>
                  <Input id="vin" name="vin" placeholder="17-character VIN" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_plate">License Plate</Label>
                  <Input id="license_plate" name="license_plate" placeholder="ABC-1234" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
            {loading
              ? isAddingToExisting
                ? "Adding Vehicle..."
                : "Adding Client..."
              : isAddingToExisting
                ? "Add Vehicle to Account"
                : "Create Client & Vehicle"}
          </Button>
        </form>
      </main>
    </div>
  )
}
