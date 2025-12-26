import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppHeader } from "@/components/app-header"
import { Plus, Car, Mail, Calendar, MapPin, ClipboardList } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { id } = await params
  const decodedId = decodeURIComponent(id)

  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("customer_email", decodedId)
    .order("created_at", { ascending: false })

  if (error || !vehicles || vehicles.length === 0) {
    notFound()
  }

  const client = vehicles[0] // Use first vehicle to get client info

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <AppHeader
        title={`${client.customer_name}'s Vehicles`}
        userEmail={user?.email}
        action={
          <Button size="sm" asChild>
            <Link href={`/protected/clients/new?email=${encodeURIComponent(client.customer_email)}&name=${encodeURIComponent(client.customer_name)}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Link>
          </Button>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        {/* Client Info Card */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tight">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Email</p>
                <p className="font-bold">{client.customer_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total Vehicles</p>
                <p className="font-bold">{vehicles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles List */}
        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight">Registered Vehicles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="group hover:shadow-md transition-shadow cursor-pointer border-none shadow-sm"
              >
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="bg-slate-100 p-3 rounded-xl">
                      <Car className="h-6 w-6 text-slate-600" />
                    </div>
                    <Button variant="ghost" size="icon" className="group-hover:text-primary" asChild>
                      <Link href={`/protected/inspections/new?vehicleId=${vehicle.id}`}>
                        <ClipboardList className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-black text-lg uppercase tracking-tight">
                      {vehicle.year} {vehicle.make}
                    </h3>
                    <p className="text-primary font-bold">{vehicle.model}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    {vehicle.license_plate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="font-mono font-bold">{vehicle.license_plate}</span>
                      </div>
                    )}
                    {vehicle.vin && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ClipboardList className="h-4 w-4" />
                        <span className="font-mono text-xs">{vehicle.vin}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Added {new Date(vehicle.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Button asChild className="w-full mt-4" size="sm">
                    <Link href={`/protected/inspections/new?vehicleId=${vehicle.id}`}>Start Inspection</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
