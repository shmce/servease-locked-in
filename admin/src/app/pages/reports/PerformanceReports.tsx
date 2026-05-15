import { BusinessReports } from "./BusinessReports";

export function PerformanceReports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Performance Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Track KPIs and performance metrics
          </p>
        </div>
      </div>
      <BusinessReports hideHeader={true} />
    </div>
  );
}