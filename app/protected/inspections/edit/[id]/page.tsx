"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Car, Settings, Eye, AlertCircle, Clock, Save, Loader2 } from "lucide-react"
import {
  updateInspection,
  getInspectionForEdit,
  type InspectionItemResult,
} from "@/app/actions/inspections"
import { toast } from "sonner"
import { TireGrid, type TirePosition } from "@/components/tire-grid"
import { AppHeader } from "@/components/app-header"

const categories = [
  {
    id: "under-car",
    label: "Under Car",
    icon: Settings,
    items: [
      "Oil leaks",
      "Coolant leaks",
      "Brake hydraulic lines",
      "Fuel leaks",
      "Exhaust system",
      "Engine/transmission mounts",
      "Suspension/shocks",
      "Steering components",
      "Drive shaft guibo",
      "Brake pads/rotors – front",
      "Brake pads/rotors – back",
      "Tire pressure/condition",
    ],
  },
  {
    id: "under-hood",
    label: "Under Hood",
    icon: Car,
    items: [
      "Engine oil level",
      "Brake/clutch fluid",
      "Coolant level",
      "Power steering fluid",
      "Battery inspection",
      "Windshield washer fluid",
      "Hoses and clamps",
      "Belts condition",
    ],
  },
  {
    id: "exterior",
    label: "Exterior",
    icon: Eye,
    items: ["Lights and signals", "Body/paint/glass", "Central locking", "Windshield wipers"],
  },
  {
    id: "road-test",
    label: "Road Test",
    icon: Clock,
    items: [
      "Brake performance",
      "Transmission shifting",
      "Clutch operation",
      "Gauges/warning lights",
      "Heating/AC",
      "Seat belts",
      "Wheel/tire inspection",
    ],
  },
]

function EditInspectionForm() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const inspectionId = params.id

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [activeTab, setActiveTab] = useState("under-car")
  const [results, setResults] = useState<Record<string, "green" | "yellow" | "red" | "na">>({})
  const [tireDepths, setTireDepths] = useState<Record<TirePosition, string>>({
    LF: "",
    RF: "",
    LR: "",
    RR: "",
  })
  const [odometer, setOdometer] = useState("")
  const [generalNotes, setGeneralNotes] = useState("")
  const [vehicleInfo, setVehicleInfo] = useState("")
  const [vehicleId, setVehicleId] = useState("")

  const loadInspection = useCallback(async () => {
    try {
      const result = await getInspectionForEdit(inspectionId)

      if (!result.success) {
        toast.error(result.error || "Failed to load inspection")
        router.push("/protected/reports")
        return
      }

      const inspection = result.data!

      setVehicleId(inspection.vehicle_id)
      setOdometer(inspection.odometer?.toString() || "")
      setGeneralNotes(inspection.notes || "")
      setVehicleInfo(
        `${inspection.vehicles.year} ${inspection.vehicles.make} ${inspection.vehicles.model}`
      )

      // Populate results from existing inspection_results
      const loadedResults: Record<string, "green" | "yellow" | "red" | "na"> = {}
      const loadedTires: Record<TirePosition, string> = { LF: "", RF: "", LR: "", RR: "" }

      inspection.inspection_results.forEach((item: { category: string; item_name: string; status: string; measurement: string | null }) => {
        if (item.category === "Tire Tread Depth") {
          // Parse tire position from item_name like "Tire Depth - LF"
          const posMatch = item.item_name.match(/Tire Depth - (LF|RF|LR|RR)/)
          if (posMatch) {
            const pos = posMatch[1] as TirePosition
            // Parse measurement like '8/32"' → '8'
            const depthMatch = item.measurement?.match(/^(\d+)\/32/)
            loadedTires[pos] = depthMatch ? depthMatch[1] : ""
          }
        } else {
          loadedResults[item.item_name] = item.status as "green" | "yellow" | "red" | "na"
        }
      })

      setResults(loadedResults)
      setTireDepths(loadedTires)
    } catch (err) {
      console.error("Error loading inspection:", err)
      toast.error("Failed to load inspection")
      router.push("/protected/reports")
    } finally {
      setIsLoading(false)
    }
  }, [inspectionId, router])

  useEffect(() => {
    loadInspection()
  }, [loadInspection])

  const handleTireChange = (pos: TirePosition, value: string) => {
    setTireDepths((prev) => ({ ...prev, [pos]: value }))
  }

  const handleSubmit = async (status: "draft" | "completed" = "draft") => {
    if (!vehicleId) return

    try {
      if (status === "draft") setIsSavingDraft(true)
      else setIsSubmitting(true)

      const flatResults: InspectionItemResult[] = []

      // Standard items
      categories.forEach((cat) => {
        cat.items.forEach((item) => {
          flatResults.push({
            category: cat.label,
            item_name: item,
            status: results[item] || "na",
          })
        })
      })

      // Tire items
      Object.entries(tireDepths).forEach(([pos, depth]) => {
        if (depth) {
          flatResults.push({
            category: "Tire Tread Depth",
            item_name: `Tire Depth - ${pos}`,
            status: Number.parseInt(depth) >= 6 ? "green" : Number.parseInt(depth) >= 3 ? "yellow" : "red",
            measurement: `${depth}/32"`,
          })
        }
      })

      const res = await updateInspection(
        inspectionId,
        Number.parseInt(odometer) || 0,
        flatResults,
        generalNotes,
        status,
      )

      if (res.success) {
        if (status === "draft") {
          toast.success("Draft updated successfully!")
        } else {
          toast.success("Inspection finalized!")
        }
        router.push(`/protected/reports/${inspectionId}`)
        router.refresh()
      } else {
        toast.error(res.error || `Failed to ${status === "draft" ? "save draft" : "finalize inspection"}`)
      }
    } catch (err) {
      console.error("Error updating inspection:", err)
      toast.error(`Failed to ${status === "draft" ? "save draft" : "finalize inspection"}`)
    } finally {
      setIsSubmitting(false)
      setIsSavingDraft(false)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "green":
        return "bg-green-500 text-white"
      case "yellow":
        return "bg-yellow-400 text-black"
      case "red":
        return "bg-red-500 text-white"
      case "na":
        return "bg-slate-200 text-slate-600"
      default:
        return "bg-white border-2 text-slate-300"
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <AppHeader title="Edit Inspection" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Loading inspection...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 pb-20">
      <AppHeader
        title={`Edit: ${vehicleInfo}`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex bg-transparent"
              onClick={() => handleSubmit("draft")}
              disabled={isSavingDraft || isSubmitting}
            >
              {isSavingDraft ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Draft
                </>
              )}
            </Button>
            <Button onClick={() => handleSubmit("completed")} disabled={isSubmitting || isSavingDraft} size="sm">
              {isSubmitting ? "Finalizing..." : "Finalize Report"}
            </Button>
          </div>
        }
      />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6">
        <div className="mb-6">
          <Label htmlFor="odometer" className="text-lg font-bold">
            Odometer Reading
          </Label>
          <Input
            id="odometer"
            type="number"
            placeholder="e.g. 45230"
            className="h-12 text-lg bg-white"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 h-auto p-1 bg-slate-100 rounded-xl mb-6">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
              >
                {cat.icon && <cat.icon className="h-5 w-5 mb-1" />}
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-tight">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="space-y-4 focus-visible:outline-none">
              <div className="grid gap-3">
                {cat.items.map((item) => (
                  <Card
                    key={item}
                    className={`overflow-hidden border-none shadow-sm transition-colors ${
                      results[item] === "red"
                        ? "bg-red-50/50"
                        : results[item] === "yellow"
                          ? "bg-yellow-50/50"
                          : results[item] === "green"
                            ? "bg-green-50/50"
                            : "bg-white"
                    }`}
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800">{item}</h3>
                          {results[item] === "red" && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-xs font-bold">
                              <AlertCircle className="h-3 w-3" />
                              NEEDS IMMEDIATE ATTENTION
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {(["green", "yellow", "red", "na"] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => setResults((prevResults) => ({ ...prevResults, [item]: status }))}
                              className={`
                                flex-1 md:flex-none w-full md:w-16 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95
                                ${results[item] === status ? getStatusColor(status) : "bg-white border-2 border-slate-100 text-slate-300 hover:border-slate-200"}
                              `}
                            >
                              {results[item] === status ? (
                                <Check className="h-6 w-6 stroke-[3px]" />
                              ) : (
                                <span className="text-[10px] font-black uppercase">{status}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold uppercase tracking-tight">Tire Tread Depth</h2>
          </div>
          <TireGrid values={tireDepths} onChange={handleTireChange} />
        </div>

        <div className="mt-8 space-y-4">
          <Label htmlFor="general-notes" className="text-lg font-bold">
            General Inspection Notes
          </Label>
          <Textarea
            id="general-notes"
            placeholder="Add any additional observations..."
            className="min-h-[150px] bg-white border-none shadow-sm rounded-xl p-4 text-lg"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
          />
        </div>
      </main>
    </div>
  )
}

export default function EditInspectionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-slate-50/50">
          <AppHeader title="Edit Inspection" />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      }
    >
      <EditInspectionForm />
    </Suspense>
  )
}
