import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
  Download,
} from "lucide-react";
import { notifyBackendRequired } from "../utils/backendRequired";

interface Settlement {
  id: string;
  providerName: string;
  serviceCategory: string;
  amount: number;
  requestDate: string;
  dueDate: string;
  status: "pending" | "approved" | "rejected" | "paid" | "overdue";
  bankAccount: string;
  accountName: string;
  transactionCount: number;
}

const settlementsData: Settlement[] = [
  {
    id: "SETTLE-2026-001",
    providerName: "HomeFixPro Manila",
    serviceCategory: "Home Maintenance & Repair",
    amount: 45230,
    requestDate: "2026-03-01",
    dueDate: "2026-03-08",
    status: "pending",
    bankAccount: "BPI - 1234567890",
    accountName: "Juan Dela Cruz",
    transactionCount: 23,
  },
  {
    id: "SETTLE-2026-002",
    providerName: "Glow Beauty Spa",
    serviceCategory: "Beauty Wellness & Personal Care",
    amount: 32890,
    requestDate: "2026-03-02",
    dueDate: "2026-03-09",
    status: "pending",
    bankAccount: "BDO - 9876543210",
    accountName: "Maria Santos",
    transactionCount: 18,
  },
  {
    id: "SETTLE-2026-003",
    providerName: "Sparkle Clean Services",
    serviceCategory: "Domestic & Cleaning Services",
    amount: 28450,
    requestDate: "2026-02-28",
    dueDate: "2026-03-07",
    status: "approved",
    bankAccount: "Metrobank - 5551234567",
    accountName: "Ana Cruz",
    transactionCount: 31,
  },
  {
    id: "SETTLE-2026-004",
    providerName: "Pawsome Pet Care",
    serviceCategory: "Pet Services",
    amount: 18900,
    requestDate: "2026-03-03",
    dueDate: "2026-03-10",
    status: "pending",
    bankAccount: "Unionbank - 7778889999",
    accountName: "Roberto Garcia",
    transactionCount: 14,
  },
  {
    id: "SETTLE-2026-005",
    providerName: "Celebrate Events Co.",
    serviceCategory: "Events & Entertainment",
    amount: 87340,
    requestDate: "2026-03-01",
    dueDate: "2026-03-08",
    status: "approved",
    bankAccount: "Security Bank - 4445556666",
    accountName: "Carmen Dela Cruz",
    transactionCount: 8,
  },
  {
    id: "SETTLE-2026-006",
    providerName: "TechFix Auto Solutions",
    serviceCategory: "Automotive & Tech Support",
    amount: 52100,
    requestDate: "2026-02-27",
    dueDate: "2026-03-06",
    status: "overdue",
    bankAccount: "BPI - 3332221111",
    accountName: "Miguel Torres",
    transactionCount: 19,
  },
  {
    id: "SETTLE-2026-007",
    providerName: "QuickFix Plumbing",
    serviceCategory: "Home Maintenance & Repair",
    amount: 39870,
    requestDate: "2026-03-02",
    dueDate: "2026-03-09",
    status: "pending",
    bankAccount: "BDO - 8887776655",
    accountName: "Sofia Ramos",
    transactionCount: 22,
  },
  {
    id: "SETTLE-2026-008",
    providerName: "Tutor Excellence Hub",
    serviceCategory: "Education & Professional Services",
    amount: 24560,
    requestDate: "2026-03-03",
    dueDate: "2026-03-10",
    status: "pending",
    bankAccount: "Metrobank - 6665554444",
    accountName: "Daniel Fernandez",
    transactionCount: 16,
  },
  {
    id: "SETTLE-2026-009",
    providerName: "Wellness Massage Therapy",
    serviceCategory: "Beauty Wellness & Personal Care",
    amount: 31200,
    requestDate: "2026-02-29",
    dueDate: "2026-03-08",
    status: "paid",
    bankAccount: "Unionbank - 9998887777",
    accountName: "Isabella Morales",
    transactionCount: 15,
  },
  {
    id: "SETTLE-2026-010",
    providerName: "Crystal Clear Housekeeping",
    serviceCategory: "Domestic & Cleaning Services",
    amount: 41230,
    requestDate: "2026-03-01",
    dueDate: "2026-03-08",
    status: "approved",
    bankAccount: "Security Bank - 1112223333",
    accountName: "Rafael Castillo",
    transactionCount: 28,
  },
  {
    id: "SETTLE-2026-011",
    providerName: "Happy Tails Grooming",
    serviceCategory: "Pet Services",
    amount: 22890,
    requestDate: "2026-02-26",
    dueDate: "2026-03-05",
    status: "rejected",
    bankAccount: "BPI - 2223334444",
    accountName: "Patricia Alvarez",
    transactionCount: 13,
  },
  {
    id: "SETTLE-2026-012",
    providerName: "Party Perfect Planners",
    serviceCategory: "Events & Entertainment",
    amount: 95670,
    requestDate: "2026-03-02",
    dueDate: "2026-03-09",
    status: "pending",
    bankAccount: "BDO - 5556667777",
    accountName: "Gabriel Sanchez",
    transactionCount: 6,
  },
];

const stats = [
  {
    title: "Pending Settlements",
    value: "6",
    change: "₱289.6K total",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    title: "Approved (Awaiting Payment)",
    value: "3",
    change: "₱168.9K total",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Overdue",
    value: "1",
    change: "₱52.1K total",
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "Paid Today",
    value: "₱156.3K",
    change: "8 settlements processed",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

export function SettlementsPayouts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [settlements, setSettlements] = useState<Settlement[]>(settlementsData);

  let filteredSettlements = settlements.filter((settlement) => {
    const matchesSearch =
      settlement.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      settlement.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || settlement.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = (settlementId: string) => {
    notifyBackendRequired(
      "Approving settlements",
      "POST /v1/admin/settlements/:id/approve",
    );
  };

  const handleReject = (settlementId: string) => {
    notifyBackendRequired(
      "Rejecting settlements",
      "POST /v1/admin/settlements/:id/reject",
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === "pending") {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          Pending Review
        </Badge>
      );
    }
    if (status === "approved") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          Approved
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          Rejected
        </Badge>
      );
    }
    if (status === "paid") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Paid
        </Badge>
      );
    }
    if (status === "overdue") {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          Overdue
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settlements & Payouts</h1>
          <p className="text-gray-500 mt-1">
            Review and process settlement requests from service providers
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settlements Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Settlement Requests</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              {filteredSettlements.length} of {settlements.length} settlements
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by provider name or settlement ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== "all") && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Clear all filters
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Settlement ID</TableHead>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Service Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSettlements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No settlements found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSettlements.map((settlement) => (
                    <TableRow key={settlement.id}>
                      <TableCell>
                        <span className="font-mono font-semibold text-gray-900">
                          {settlement.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {settlement.providerName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {settlement.serviceCategory}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600 text-lg">
                          ₱{settlement.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatDate(settlement.requestDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {formatDate(settlement.dueDate)}
                          </p>
                          {settlement.status === "overdue" && (
                            <p className="text-xs text-red-600 font-medium">Overdue!</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{settlement.accountName}</p>
                          <p className="text-gray-500">{settlement.bankAccount}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {settlement.transactionCount} txns
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                      <TableCell>
                        {settlement.status === "pending" || settlement.status === "overdue" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              title="Approve Settlement"
                              onClick={() => handleApprove(settlement.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              title="Reject Settlement"
                              onClick={() => handleReject(settlement.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Pending Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₱
                    {filteredSettlements
                      .filter((s) => s.status === "pending" || s.status === "overdue")
                      .reduce((sum, s) => sum + s.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Approved Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₱
                    {filteredSettlements
                      .filter((s) => s.status === "approved")
                      .reduce((sum, s) => sum + s.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Settlement Processing Guidelines</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>Review provider transaction history before approving settlements</li>
                <li>Verify bank account details match registered provider information</li>
                <li>Process approved settlements within 2-3 business days</li>
                <li>Overdue settlements require immediate attention and manager approval</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
