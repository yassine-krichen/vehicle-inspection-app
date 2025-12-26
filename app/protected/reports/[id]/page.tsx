import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, AlertCircle, Printer, ChevronLeft, Car, Calendar, MapPin, Clipboard } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PrintButton } from "./print-button"
import { ShareButton } from "./share-button"

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: inspection, error } = await supabase
    .from("inspections")
    .select(`
      *,
      vehicles (*),
      inspection_results (*)
    `)
    .eq("id", id)
    .single()

  if (error || !inspection) {
    notFound()
  }

  const resultsByCategory = inspection.inspection_results.reduce(
    (acc: any, curr: any) => {
      if (!acc[curr.category]) acc[curr.category] = []
      acc[curr.category].push(curr)
      return acc
    },
    {} as Record<string, any[]>,
  )

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "green":
        return (
          <div className="h-7 w-7 rounded-lg bg-green-500 flex items-center justify-center shadow-sm">
            <Check className="h-5 w-5 text-white stroke-[3px]" />
          </div>
        )
      case "yellow":
        return (
          <div className="h-7 w-7 rounded-lg bg-yellow-400 flex items-center justify-center shadow-sm">
            <AlertCircle className="h-5 w-5 text-black stroke-[3px]" />
          </div>
        )
      case "red":
        return (
          <div className="h-7 w-7 rounded-lg bg-red-500 flex items-center justify-center shadow-sm">
            <AlertCircle className="h-5 w-5 text-white stroke-[3px]" />
          </div>
        )
      default:
        return <div className="h-7 w-7 rounded-lg bg-slate-100 border-2 border-slate-200" />
    }
  }

  // Calculate summary stats for the customer
  const redItems = inspection.inspection_results.filter((i: any) => i.status === "red")
  const yellowItems = inspection.inspection_results.filter((i: any) => i.status === "yellow")

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" asChild className="font-bold uppercase tracking-wider">
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" /> Dashboard
            </Link>
          </Button>
          <div className="flex gap-2">
            <ShareButton reportId={id} />
            <PrintButton />
          </div>
        </div>

        {/* Report Content */}
        <Card className="border-none shadow-2xl overflow-hidden print:shadow-none print:border-none rounded-3xl">
          <CardHeader className="bg-slate-900 text-white p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-primary rounded-t-3xl">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-xl">
                  <Car className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-4xl font-black italic tracking-tighter uppercase">Mechanic Pro</CardTitle>
              </div>
              <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Certified Multi-Point Report</p>
            </div>
            <div className="text-left md:text-right space-y-1">
              <div className="text-3xl font-black italic uppercase tracking-tighter">
                {inspection.vehicles.year} {inspection.vehicles.make} {inspection.vehicles.model}
              </div>
              <div className="text-slate-400 font-mono text-sm tracking-widest">
                VIN: {inspection.vehicles.vin || "N/A"}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-10 space-y-12">
            {redItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-red-600">
                    Priority Repairs Required
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {redItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center justify-between"
                    >
                      <span className="font-bold text-red-900">{item.item_name}</span>
                      <div className="h-6 w-6 rounded bg-red-500 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Alert - Highlight Critical Issues */}
            {(redItems.length > 0 || yellowItems.length > 0) && (
              <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-primary">
                <div className="flex items-center gap-4">
                  <div className="bg-red-500 p-3 rounded-full animate-pulse">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight">Inspection Summary</h4>
                    <p className="text-slate-400 text-sm font-medium">
                      Our technician identified {redItems.length} critical issues requiring immediate attention.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-center bg-slate-800 px-6 py-3 rounded-xl">
                    <div className="text-2xl font-black text-red-500">{redItems.length}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Critical</div>
                  </div>
                  <div className="text-center bg-slate-800 px-6 py-3 rounded-xl">
                    <div className="text-2xl font-black text-yellow-400">{yellowItems.length}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Caution</div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer & Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <Clipboard className="h-3 w-3" /> Customer
                </div>
                <div className="font-black text-xl italic uppercase tracking-tight">
                  {inspection.vehicles.customer_name}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Inspection Date
                </div>
                <div className="font-black text-xl italic uppercase tracking-tight">
                  {new Date(inspection.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> Recorded Odometer
                </div>
                <div className="font-black text-xl italic uppercase tracking-tight">
                  {inspection.odometer?.toLocaleString()} MI
                </div>
              </div>
            </div>

            {/* Inspection Categories */}
            {Object.entries(resultsByCategory).length > 0 ? (
              Object.entries(resultsByCategory).map(([category, items]: [string, any]) => (
                <div key={category} className="space-y-6">
                  <div className="flex items-center justify-between border-b-4 border-slate-900 pb-3">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">{category}</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                      System Check Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                    {items.map((item: any) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between py-4 border-b border-slate-100 group transition-colors px-2 rounded-xl ${
                          item.status === "red"
                            ? "bg-red-50/30"
                            : item.status === "yellow"
                              ? "bg-yellow-50/30"
                              : "hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-slate-900 font-bold uppercase text-sm tracking-tight">
                            {item.item_name}
                          </span>
                          {item.status === "red" && (
                            <div className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                              Immediate Attention
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          {item.measurement && (
                            <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg tracking-widest">
                              {item.measurement}
                            </span>
                          )}
                          {getStatusDisplay(item.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest">
                  No detailed inspection data available.
                </p>
              </div>
            )}

            {/* Technician Notes */}
            <div className="space-y-4 pt-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Technical Observations</h3>
              <div className="bg-slate-900 text-slate-100 p-8 rounded-3xl min-h-[120px] leading-relaxed italic border-l-8 border-primary shadow-xl font-medium">
                {inspection.notes || "No additional technical observations provided for this inspection."}
              </div>
            </div>

            {/* Signature Area */}
            <div className="pt-16 grid grid-cols-2 gap-16">
              <div className="space-y-4">
                <div className="h-12 border-b-2 border-slate-200 flex items-end justify-center">
                  <span className="text-slate-400 text-sm font-medium italic">Electronically Verified</span>
                </div>
                <div className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Technician Authentication
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-12 border-b-2 border-slate-200" />
                <div className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Customer Acknowledgment
                </div>
              </div>
            </div>
          </CardContent>
          <div className="bg-slate-50 py-6 px-10 text-center border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
              Automotive Safety First • Mechanic Pro Digital Infrastructure
            </p>
          </div>
        </Card>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body { background-color: white !important; -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:p-0 { padding: 0 !important; }
        }
      `,
        }}
      />
    </div>
  )
}
