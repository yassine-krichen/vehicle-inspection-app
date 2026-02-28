"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Trash2,
  Save,
  GripVertical,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react"
import { createInvoice, type InvoiceSection, type InvoiceItem } from "@/app/actions/invoices"
import { getVehicles } from "@/app/actions/vehicles"
import { toast } from "sonner"
import { AppHeader } from "@/components/app-header"

function generateId() {
  return crypto.randomUUID()
}

interface LocalSection {
  localId: string
  title: string
  sort_order: number
  items: LocalItem[]
}

interface LocalItem {
  localId: string
  description: string
  quantity: number
  unit_price: number
  sort_order: number
}

interface Vehicle {
  id: string
  customer_name: string
  customer_email: string
  make: string
  model: string
  year: number
  vin: string | null
  license_plate: string | null
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Vehicles data
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)

  // Client & vehicle selection
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedVehicleId, setSelectedVehicleId] = useState("")

  // Customer info
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [vehicleInfo, setVehicleInfo] = useState("")
  const [notes, setNotes] = useState("")
  const [taxRate, setTaxRate] = useState("0")

  // Load vehicles on mount
  const loadVehicles = useCallback(async () => {
    try {
      const data = await getVehicles()
      setVehicles(data as Vehicle[])
    } catch (err) {
      console.error("Failed to load vehicles:", err)
    } finally {
      setIsLoadingVehicles(false)
    }
  }, [])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  // Derive unique clients from vehicles
  const clients = vehicles.reduce<{ name: string; email: string }[]>((acc, v) => {
    const key = v.customer_email || v.customer_name
    if (!acc.find((c) => (c.email || c.name) === key)) {
      acc.push({ name: v.customer_name, email: v.customer_email })
    }
    return acc
  }, [])

  // Vehicles for the selected client
  const clientVehicles = selectedClient
    ? vehicles.filter((v) => (v.customer_email || v.customer_name) === selectedClient)
    : []

  const handleClientChange = (clientKey: string) => {
    setSelectedClient(clientKey)
    setSelectedVehicleId("")
    setVehicleInfo("")

    const client = clients.find((c) => (c.email || c.name) === clientKey)
    if (client) {
      setCustomerName(client.name)
      setCustomerEmail(client.email || "")
    }
  }

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (vehicle) {
      setVehicleInfo(`${vehicle.year} ${vehicle.make} ${vehicle.model}`)
    }
  }

  // Dynamic sections
  const [sections, setSections] = useState<LocalSection[]>([
    {
      localId: generateId(),
      title: "Labor",
      sort_order: 0,
      items: [
        { localId: generateId(), description: "", quantity: 1, unit_price: 0, sort_order: 0 },
      ],
    },
  ])

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        localId: generateId(),
        title: "",
        sort_order: prev.length,
        items: [
          { localId: generateId(), description: "", quantity: 1, unit_price: 0, sort_order: 0 },
        ],
      },
    ])
  }

  const removeSection = (sectionLocalId: string) => {
    if (sections.length <= 1) {
      toast.error("Invoice must have at least one section")
      return
    }
    setSections((prev) => prev.filter((s) => s.localId !== sectionLocalId))
  }

  const updateSectionTitle = (sectionLocalId: string, title: string) => {
    setSections((prev) =>
      prev.map((s) => (s.localId === sectionLocalId ? { ...s, title } : s)),
    )
  }

  const addItem = (sectionLocalId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.localId !== sectionLocalId) return s
        return {
          ...s,
          items: [
            ...s.items,
            {
              localId: generateId(),
              description: "",
              quantity: 1,
              unit_price: 0,
              sort_order: s.items.length,
            },
          ],
        }
      }),
    )
  }

  const removeItem = (sectionLocalId: string, itemLocalId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.localId !== sectionLocalId) return s
        if (s.items.length <= 1) {
          toast.error("Section must have at least one item")
          return s
        }
        return { ...s, items: s.items.filter((i) => i.localId !== itemLocalId) }
      }),
    )
  }

  const updateItem = (
    sectionLocalId: string,
    itemLocalId: string,
    field: keyof LocalItem,
    value: string | number,
  ) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.localId !== sectionLocalId) return s
        return {
          ...s,
          items: s.items.map((i) => {
            if (i.localId !== itemLocalId) return i
            return { ...i, [field]: value }
          }),
        }
      }),
    )
  }

  const calculateItemAmount = (item: LocalItem) => {
    return Number(item.quantity) * Number(item.unit_price)
  }

  const calculateSubtotal = () => {
    return sections.reduce(
      (sum, section) =>
        sum + section.items.reduce((s, item) => s + calculateItemAmount(item), 0),
      0,
    )
  }

  const calculateTax = () => {
    return calculateSubtotal() * (Number(taxRate) / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required")
      return
    }

    // Validate sections
    for (const section of sections) {
      if (!section.title.trim()) {
        toast.error("All sections must have a title")
        return
      }
      for (const item of section.items) {
        if (!item.description.trim()) {
          toast.error(`All items in "${section.title}" must have a description`)
          return
        }
      }
    }

    try {
      setIsSubmitting(true)

      const invoiceSections: InvoiceSection[] = sections.map((s, si) => ({
        title: s.title,
        sort_order: si,
        items: s.items.map((item, ii) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          amount: calculateItemAmount(item),
          sort_order: ii,
        })) as InvoiceItem[],
      }))

      const result = await createInvoice({
        customer_name: customerName,
        customer_email: customerEmail || undefined,
        vehicle_info: vehicleInfo || undefined,
        notes: notes || undefined,
        tax_rate: Number(taxRate),
        sections: invoiceSections,
      })

      if (result.success) {
        toast.success("Invoice created successfully!")
        router.push(`/protected/invoices/${result.id}`)
      } else {
        toast.error(result.error || "Failed to create invoice")
      }
    } catch (err) {
      console.error("Error creating invoice:", err)
      toast.error("Failed to create invoice")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 pb-20">
      <AppHeader
        title="New Invoice"
        action={
          <Button onClick={handleSubmit} disabled={isSubmitting} size="sm">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Invoice
              </>
            )}
          </Button>
        }
      />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 space-y-8">
        {/* Customer & Vehicle Info */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client & Vehicle Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">
                  Select Client <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedClient} onValueChange={handleClientChange} disabled={isLoadingVehicles}>
                  <SelectTrigger className="w-full bg-white h-10">
                    <SelectValue placeholder={isLoadingVehicles ? "Loading clients..." : "Choose a client"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => {
                      const key = client.email || client.name
                      return (
                        <SelectItem key={key} value={key}>
                          <span className="font-bold">{client.name}</span>
                          {client.email && (
                            <span className="ml-2 text-slate-400 text-xs">{client.email}</span>
                          )}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Select Vehicle</Label>
                <Select
                  value={selectedVehicleId}
                  onValueChange={handleVehicleChange}
                  disabled={!selectedClient || clientVehicles.length === 0}
                >
                  <SelectTrigger className="w-full bg-white h-10">
                    <SelectValue
                      placeholder={
                        !selectedClient
                          ? "Select a client first"
                          : clientVehicles.length === 0
                            ? "No vehicles found"
                            : "Choose a vehicle"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {clientVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <span className="font-bold">
                          {v.year} {v.make} {v.model}
                        </span>
                        {v.license_plate && (
                          <span className="ml-2 text-slate-400 text-xs">({v.license_plate})</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Auto-filled fields (read-only display) */}
            {selectedClient && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</span>
                  <p className="font-bold text-sm text-slate-800">{customerName}</p>
                </div>
                {customerEmail && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</span>
                    <p className="font-bold text-sm text-slate-800">{customerEmail}</p>
                  </div>
                )}
                {vehicleInfo && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle</span>
                    <p className="font-bold text-sm text-slate-800">{vehicleInfo}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Sections */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tight">Line Items</h2>
            <Button variant="outline" size="sm" onClick={addSection} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>

          {sections.map((section, sectionIndex) => (
            <Card key={section.localId} className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-900 text-white py-4 px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="h-5 w-5 text-slate-500 shrink-0" />
                    <Input
                      value={section.title}
                      onChange={(e) => updateSectionTitle(section.localId, e.target.value)}
                      placeholder="Section title (e.g. Labor, Parts, Diagnostics)"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 font-bold h-10"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-400 hover:bg-slate-800 shrink-0"
                    onClick={() => removeSection(section.localId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Column headers */}
                <div className="hidden md:grid grid-cols-[1fr_100px_120px_100px_40px] gap-4 px-6 py-3 bg-slate-50 border-b text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Description</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Unit Price</span>
                  <span className="text-right">Amount</span>
                  <span />
                </div>

                {section.items.map((item) => (
                  <div
                    key={item.localId}
                    className="grid grid-cols-1 md:grid-cols-[1fr_100px_120px_100px_40px] gap-4 px-6 py-4 border-b border-slate-100 items-center"
                  >
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(section.localId, item.localId, "description", e.target.value)
                      }
                      placeholder="Item description"
                      className="bg-white"
                    />
                    <div className="flex items-center gap-2 md:block">
                      <Label className="md:hidden text-xs text-slate-400 font-bold">Qty:</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(section.localId, item.localId, "quantity", Number(e.target.value))
                        }
                        className="bg-white text-right"
                      />
                    </div>
                    <div className="flex items-center gap-2 md:block">
                      <Label className="md:hidden text-xs text-slate-400 font-bold">Price:</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(section.localId, item.localId, "unit_price", Number(e.target.value))
                        }
                        className="bg-white text-right"
                      />
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="font-bold text-slate-700">
                        ${calculateItemAmount(item).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-red-500 p-0 h-8 w-8"
                      onClick={() => removeItem(section.localId, item.localId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="px-6 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addItem(section.localId)}
                    className="text-primary font-bold gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Totals & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label htmlFor="notes" className="text-lg font-bold">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Payment terms, special instructions, warranty info..."
              className="min-h-[150px] bg-white border-none shadow-sm rounded-xl p-4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Card className="border-none shadow-sm h-fit">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Subtotal</span>
                <span className="text-lg font-black">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tax</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-20 h-8 text-sm text-right bg-white"
                  />
                  <span className="text-sm text-slate-400">%</span>
                </div>
                <span className="text-lg font-bold text-slate-600">${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-4 border-t-4 border-slate-900">
                <span className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Total
                </span>
                <span className="text-3xl font-black text-primary">${calculateTotal().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
