import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, FileText, Calendar, DollarSign, Car, User, Clipboard } from "lucide-react"
import Link from "next/link"
import { getInvoice } from "@/app/actions/invoices"
import { InvoiceActions } from "./invoice-actions"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const invoice = await getInvoice(id)

  if (invoice) {
    return {
      title: `Invoice ${invoice.invoice_number} - ${invoice.customer_name} | Mechanic Pro`,
    }
  }

  return {
    title: "Invoice | Mechanic Pro",
  }
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)

  if (!invoice) {
    notFound()
  }

  const statusConfig = {
    draft: { label: "Draft", className: "bg-yellow-100 text-yellow-700" },
    sent: { label: "Sent", className: "bg-blue-100 text-blue-700" },
    paid: { label: "Paid", className: "bg-green-100 text-green-700" },
  } as const

  const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.draft

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" asChild className="font-bold uppercase tracking-wider">
            <Link href="/protected/invoices">
              <ChevronLeft className="mr-2 h-4 w-4" /> All Invoices
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-wider ${status.className}`}
            >
              {status.label}
            </span>
            <InvoiceActions invoiceId={id} status={invoice.status} invoice={invoice} />
          </div>
        </div>

        {/* Invoice Content */}
        <Card className="border-none shadow-2xl overflow-hidden print:shadow-none print:border-none rounded-3xl py-0">
          {/* Header */}
          <CardHeader className="bg-slate-900 text-white p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-primary rounded-t-3xl">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-xl">
                  <FileText className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-4xl font-black italic tracking-tighter uppercase">Mechanic Pro</CardTitle>
              </div>
              <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Service Invoice</p>
            </div>
            <div className="text-left md:text-right space-y-1">
              <div className="text-3xl font-black italic uppercase tracking-tighter">
                {invoice.invoice_number}
              </div>
              <div className="text-slate-400 font-mono text-sm tracking-widest">
                {new Date(invoice.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-10 py-10 space-y-12">
            {/* Customer & Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <Clipboard className="h-3 w-3" /> Customer
                </div>
                <div className="font-black text-xl italic uppercase tracking-tight">
                  {invoice.customer_name}
                </div>
                {invoice.customer_email && (
                  <div className="text-sm text-slate-500">{invoice.customer_email}</div>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Invoice Date
                </div>
                <div className="font-black text-xl italic uppercase tracking-tight">
                  {new Date(invoice.created_at).toLocaleDateString()}
                </div>
              </div>
              {invoice.vehicle_info && (
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <Car className="h-3 w-3" /> Vehicle
                  </div>
                  <div className="font-black text-xl italic uppercase tracking-tight">
                    {invoice.vehicle_info}
                  </div>
                </div>
              )}
            </div>

            {/* Sections with Items */}
            {invoice.sections && invoice.sections.length > 0 ? (
              invoice.sections.map((section: { id: string; title: string; invoice_items: { id: string; description: string; quantity: number; unit_price: number; amount: number }[] }) => (
                <div key={section.id} className="space-y-6">
                  <div className="flex items-center justify-between border-b-4 border-slate-900 pb-3">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">{section.title}</h3>
                  </div>

                  {/* Table header */}
                  <div className="hidden md:grid grid-cols-[1fr_80px_100px_100px] gap-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Description</span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Unit Price</span>
                    <span className="text-right">Amount</span>
                  </div>

                  <div className="space-y-1">
                    {section.invoice_items.map((item: { id: string; description: string; quantity: number; unit_price: number; amount: number }) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr_80px_100px_100px] gap-4 px-4 py-4 border-b border-slate-100 items-center hover:bg-slate-50/50 rounded-xl"
                      >
                        <span className="font-bold text-slate-900 uppercase text-sm tracking-tight">
                          {item.description}
                        </span>
                        <span className="text-right text-sm text-slate-600 font-medium">
                          {Number(item.quantity)}
                        </span>
                        <span className="text-right text-sm text-slate-600 font-medium">
                          ${Number(item.unit_price).toFixed(2)}
                        </span>
                        <span className="text-right font-bold text-slate-900">
                          ${Number(item.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest">No line items</p>
              </div>
            )}

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-80 space-y-3">
                <div className="flex justify-between py-2 text-sm">
                  <span className="font-bold text-slate-500 uppercase tracking-wider">Subtotal</span>
                  <span className="font-black text-lg">${Number(invoice.subtotal).toFixed(2)}</span>
                </div>
                {Number(invoice.tax_rate) > 0 && (
                  <div className="flex justify-between py-2 text-sm border-t border-slate-100">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">
                      Tax ({Number(invoice.tax_rate)}%)
                    </span>
                    <span className="font-bold text-slate-600">${Number(invoice.tax_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-4 border-t-4 border-slate-900">
                  <span className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Total Due
                  </span>
                  <span className="text-3xl font-black text-primary">${Number(invoice.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="space-y-4 pt-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Notes</h3>
                <div className="bg-slate-900 text-slate-100 p-8 rounded-3xl min-h-[80px] leading-relaxed italic border-l-8 border-primary shadow-xl font-medium">
                  {invoice.notes}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-16 text-center space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Thank you for your business
              </p>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                Mechanic Pro Digital Shop System
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { 
              background-color: white !important; 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print\\:hidden { display: none !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:border-none { border: none !important; }
            .print\\:p-0 { padding: 0 !important; }
            .print\\:bg-white { background-color: white !important; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `,
      }} />
    </div>
  )
}
