import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ClipboardList, Users, Car, ChevronRight, AlertTriangle, FileText } from "lucide-react"
import { getRecentInspections } from "@/app/actions/inspections"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"

export default async function Dashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const inspections = await getRecentInspections()

  // Calculate some basic stats
  const totalInspections = inspections?.length || 0
  const completedInspections = inspections?.filter((i) => i.status === "completed").length || 0

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <AppHeader
        userEmail={user?.email}
        action={
          <Button asChild size="sm">
            <Link href="/protected/clients">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Inspection
            </Link>
          </Button>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Recent Inspections
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{totalInspections}</div>
              <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Updated just now</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Completed Total
              </CardTitle>
              <Car className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{completedInspections}</div>
              <p className="text-xs text-green-600 font-bold uppercase mt-1">High Accuracy Rate</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">Efficiency</CardTitle>
              <Users className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">100%</div>
              <p className="text-xs font-bold uppercase mt-1 opacity-80">Digital Flow Optimized</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions & Recent List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight">Recent Activity</h2>
              <Button variant="ghost" size="sm" className="text-primary font-bold uppercase tracking-wider" asChild>
                <Link href="/protected/reports">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {!inspections || inspections.length === 0 ? (
              <Card className="border-dashed border-2 py-12 bg-white/50">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="bg-slate-100 p-4 rounded-full">
                    <ClipboardList className="h-10 w-10 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">No Recent Inspections</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      Start your day by performing a multi-point inspection for a client.
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/protected/clients">Add First Client</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white border-none rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {inspections.map((item) => (
                    <Link
                      key={item.id}
                      href={`/protected/reports/${item.id}`}
                      className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Car className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {item.vehicles?.year} {item.vehicles?.make} {item.vehicles?.model}
                          </div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {item.vehicles?.customer_name} • {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-wider ${
                            item.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.status}
                        </span>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <Button
                asChild
                variant="outline"
                className="h-24 justify-start px-6 gap-4 border-none shadow-sm hover:bg-primary/5 bg-white rounded-2xl group"
              >
                <Link href="/protected/clients">
                  <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg">Manage Clients</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                      Active Customer Database
                    </div>
                  </div>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-24 justify-start px-6 gap-4 border-none shadow-sm hover:bg-primary/5 bg-white rounded-2xl group"
              >
                <Link href="/protected/reports">
                  <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg">Report History</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                      Review Past Inspections
                    </div>
                  </div>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-24 justify-start px-6 gap-4 border-none shadow-sm hover:bg-primary/5 bg-white rounded-2xl group"
              >
                <Link href="/protected/invoices">
                  <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg">Invoices</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                      Manage & Print Invoices
                    </div>
                  </div>
                </Link>
              </Button>
            </div>

            <Card className="bg-slate-900 border-none shadow-xl text-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Shop Notice
                </CardTitle>
                <CardDescription className="text-slate-400">Important technical updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  Digital inspection flow is now live. Ensure all tire tread depths are recorded for accurate safety
                  reporting.
                </p>
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <span>System Status</span>
                    <span className="text-green-500">Online</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
