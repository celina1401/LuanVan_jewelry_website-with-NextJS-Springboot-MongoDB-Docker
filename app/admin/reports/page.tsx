import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reports | Admin Dashboard",
  description: "View and manage system reports",
}

export default function ReportsPage() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <div className="grid gap-4">
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-4">Sales Reports</h2>
          <p className="text-muted-foreground">Sales reports and analytics will be displayed here.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-4">Inventory Reports</h2>
          <p className="text-muted-foreground">Inventory status and movement reports will be displayed here.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-4">User Activity Reports</h2>
          <p className="text-muted-foreground">User activity and engagement reports will be displayed here.</p>
        </div>
      </div>
    </div>
  )
} 