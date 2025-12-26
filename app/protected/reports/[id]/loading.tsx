import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReportLoadingPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Report card skeleton */}
        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
          <CardHeader className="bg-slate-900 text-white p-10">
            <Skeleton className="h-10 w-64 bg-slate-700" />
            <Skeleton className="h-4 w-48 bg-slate-700 mt-2" />
          </CardHeader>

          <CardContent className="p-10 space-y-8">
            {/* Summary skeleton */}
            <div className="bg-slate-100 rounded-2xl p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Info grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>

            {/* Categories skeleton */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
