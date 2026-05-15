import { BusinessReports } from "./BusinessReports";

export function ComplianceReports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Compliance Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Generate regulatory and compliance reports
          </p>
        </div>
      </div>
      <BusinessReports hideHeader={true} />
    </div>
  );
}