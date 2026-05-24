import { useMemo, useState } from "react";
import { Download, Search, ServerCog } from "lucide-react";
import {
  backendSupportMatrix,
  type BackendSupportStatus,
} from "../config/backendSupportMatrix";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const statusLabels: Record<BackendSupportStatus, string> = {
  wired: "Wired",
};

function statusBadge(status: BackendSupportStatus) {
  const className = "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]";

  return <Badge className={className}>{statusLabels[status]}</Badge>;
}

function exportRows() {
  const headers = [
    "Area",
    "Screen",
    "Status",
    "Current Support",
    "Existing Endpoints",
    "Backend Needed",
    "Notes",
  ];
  const rows = backendSupportMatrix.map((item) => [
    item.area,
    item.screen,
    statusLabels[item.status],
    item.currentSupport,
    item.existingEndpoints.join("; "),
    item.backendNeeded.join("; "),
    item.notes,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `admin-backend-support-matrix-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function BackendSupportMatrix() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    const query = searchTerm.toLowerCase();

    return backendSupportMatrix.filter((item) => {
      const searchable = [
        item.area,
        item.screen,
        item.currentSupport,
        item.notes,
        ...item.existingEndpoints,
        ...item.backendNeeded,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);

      return matchesSearch;
    });
  }, [searchTerm]);

  const counts = useMemo(() => {
    return backendSupportMatrix.reduce<Record<BackendSupportStatus, number>>(
      (totals, item) => {
        totals[item.status] += 1;
        return totals;
      },
      { wired: 0 },
    );
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backend Support Matrix</h1>
          <p className="text-gray-500 mt-1">
            Tracks the admin capabilities currently wired to backend contracts.
          </p>
        </div>
        <Button onClick={exportRows} className="bg-[#00BF63] hover:bg-[#00A055]">
          <Download className="w-4 h-4 mr-2" />
          Export Matrix
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(counts).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {statusLabels[status as BackendSupportStatus]}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                </div>
                <ServerCog className="w-6 h-6 text-[#16A34A]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Backend Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search screen, endpoint, or capability..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Screen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Admin Support</TableHead>
                  <TableHead>Backend Needed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={`${item.area}-${item.screen}`}>
                    <TableCell className="font-medium text-gray-900">{item.area}</TableCell>
                    <TableCell>{item.screen}</TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell className="min-w-[280px]">
                      <p className="text-sm text-gray-700">{item.currentSupport}</p>
                      {item.existingEndpoints.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Existing: {item.existingEndpoints.join(", ")}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[320px]">
                      {item.backendNeeded.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {item.backendNeeded.map((endpoint) => (
                            <Badge key={endpoint} variant="outline" className="font-mono text-[11px]">
                              {endpoint}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No backend change needed</span>
                      )}
                      <p className="text-xs text-gray-500 mt-2">{item.notes}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
