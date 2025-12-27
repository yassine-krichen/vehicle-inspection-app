import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, AlertCircle, Car, Calendar, MapPin, Clipboard } from "lucide-react"

type InspectionResult = {
  id: string
  category: string
  item_name: string
  status: "green" | "yellow" | "red" | "na"
  measurement: string | null
  notes: string | null
}

type InspectionData = {
  id: string
  created_at: string
  odometer: number
  notes: string | null
  status: string
  vehicles: {
    year: number
    make: string
    model: string
    vin: string | null
    customer_name: string
  }
  inspection_results: InspectionResult[]
}

type InspectionReportProps = {
  inspection: InspectionData
  showInternalNotes?: boolean
}

export function InspectionReport({ inspection, showInternalNotes = false }: InspectionReportProps) {
  const resultsByCategory = inspection.inspection_results.reduce(
    (acc: Record<string, InspectionResult[]>, curr: InspectionResult) => {
      if (!acc[curr.category]) acc[curr.category] = []
      acc[curr.category].push(curr)
      return acc
    },
    {} as Record<string, InspectionResult[]>,
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

  const redItems = inspection.inspection_results.filter((i) => i.status === "red")
  const yellowItems = inspection.inspection_results.filter((i) => i.status === "yellow")

  return (
    <Card className="border-none shadow-2xl overflow-hidden print:shadow-none print:border-none rounded-3xl py-0">
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

      <CardContent className="p-10 py-10 space-y-12">{/* Override default py-6 with py-10 for report spacing */}
        {redItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="text-xl font-black uppercase tracking-tight text-red-600">
                Priority Repairs Required
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redItems.map((item) => (
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

        {(redItems.length > 0 || yellowItems.length > 0) && (
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-primary">
            <div className="flex items-center gap-4">
              <div className="bg-red-500 p-3 rounded-full animate-pulse">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight">Inspection Summary</h4>
                <p className="text-slate-400 text-sm font-medium">
                  Our technician identified {redItems.length} critical issue{redItems.length !== 1 ? "s" : ""}{" "}
                  requiring immediate attention.
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

        {Object.entries(resultsByCategory).length > 0 ? (
          Object.entries(resultsByCategory).map(([category, items]: [string, InspectionResult[]]) => (
            <div key={category} className="space-y-6">
              <div className="flex items-center justify-between border-b-4 border-slate-900 pb-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">{category}</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  System Check Verified
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                {items.map((item) => (
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

        {showInternalNotes && inspection.notes && (
          <div className="space-y-4 pt-8 print:hidden">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Internal Notes (Mechanic Only)</h3>
            <div className="bg-slate-900 text-slate-100 p-8 rounded-3xl min-h-[120px] leading-relaxed italic border-l-8 border-primary shadow-xl font-medium">
              {inspection.notes}
            </div>
          </div>
        )}

        {!showInternalNotes && inspection.notes && (
          <div className="space-y-4 pt-8">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Technical Observations</h3>
            <div className="bg-slate-900 text-slate-100 p-8 rounded-3xl min-h-[120px] leading-relaxed italic border-l-8 border-primary shadow-xl font-medium">
              {inspection.notes}
            </div>
          </div>
        )}

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
  )
}
