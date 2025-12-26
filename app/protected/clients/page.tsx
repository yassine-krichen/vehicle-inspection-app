import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, User, Car } from "lucide-react"
import Link from "next/link"
import { getVehicles } from "@/app/actions/vehicles"
import { AppHeader } from "@/components/app-header"
import { createClient } from "@/lib/supabase/server"

type ClientData = {
  customer_name: string
  customer_email: string
  vehicles: any[]
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const vehicles = await getVehicles()

  const clientsMap = vehicles.reduce(
    (acc, vehicle) => {
      const email = vehicle.customer_email
      if (!acc[email]) {
        acc[email] = {
          customer_name: vehicle.customer_name,
          customer_email: vehicle.customer_email,
          vehicles: [],
        }
      }
      acc[email].vehicles.push(vehicle)
      return acc
    },
    {} as Record<string, ClientData>,
  )

  const clients: ClientData[] = Object.values(clientsMap)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <AppHeader
        title="Clients"
        userEmail={user?.email}
        action={
          <Button size="sm" asChild>
            <Link href="/protected/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Link>
          </Button>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients by name, email, or vehicle..." className="pl-10 h-12 text-lg bg-white" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="bg-slate-100 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <User className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold">No clients found</h3>
              <p className="text-muted-foreground">Start by adding your first customer and vehicle.</p>
              <Button asChild>
                <Link href="/protected/clients/new">Add First Client</Link>
              </Button>
            </div>
          ) : (
            clients.map((client) => (
              <Link key={client.customer_email} href={`/protected/clients/${encodeURIComponent(client.customer_email)}`}>
                <Card className="group hover:shadow-md transition-shadow cursor-pointer border-none shadow-sm h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="bg-slate-100 p-3 rounded-xl">
                        <User className="h-6 w-6 text-slate-600" />
                      </div>
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                        {client.vehicles.length} {client.vehicles.length === 1 ? "Vehicle" : "Vehicles"}
                      </div>
                    </div>

                    <div className="mt-4 space-y-1">
                      <h3 className="font-bold text-lg">{client.customer_name}</h3>
                      <p className="text-sm text-muted-foreground">{client.customer_email}</p>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Car className="h-4 w-4" />
                        <span className="font-medium">
                          {client.vehicles.map((v) => `${v.year} ${v.make} ${v.model}`).join(", ")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
