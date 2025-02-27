import { TimesheetForm } from "@/components/timesheet-form"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Submit Timesheet</h1>
          <p className="text-muted-foreground">Record your daily work activities and hours</p>
        </div>
        <TimesheetForm />
      </div>
    </div>
  )
}

