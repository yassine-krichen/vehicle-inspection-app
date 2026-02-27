import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList, ChevronRight, Car, Calendar, User, FileEdit } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"

export default async function ReportsListPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: inspections, error } = await supabase
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <AppHeader
        title="Inspection Reports"
        userEmail={user?.email}
        action={
          <Button size="sm" asChild>
            <Link href="/protected/inspections/new">New Inspection</Link>
          </Button>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        {!inspections || inspections.length === 0 ? (
          <Card className="border-dashed border-2 py-20">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-slate-100 p-4 rounded-full">
                <ClipboardList className="h-10 w-10 text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl">No reports found</h3>
                <p className="text-muted-foreground">You haven&apos;t completed any vehicle inspections yet.</p>
              </div>
              <Button asChild>
                <Link href="/protected/inspections/new">Start Your First Inspection</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inspections.map((report) => (
              <Link key={report.id} href={`/protected/reports/${report.id}`}>
                <Card className="group hover:shadow-md transition-shadow cursor-pointer border-none shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-3 rounded-xl text-primary">
                          <Car className="h-6 w-6" />
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-wider ${
                            report.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-lg">
                        {report.vehicles.year} {report.vehicles.make} {report.vehicles.model}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-primary font-medium">
                        <User className="h-3 w-3" />
                        {report.vehicles.customer_name}
                      </div>
                    </div>

                    <div className="pt-4 border-t grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Date
                        </div>
                        <div className="text-xs font-bold text-slate-600">
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <ClipboardList className="h-3 w-3" /> Mileage
                        </div>
                        <div className="text-xs font-bold text-slate-600">{report.odometer?.toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
