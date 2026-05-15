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
  DollarSign,
  Edit2,
  Save,
  X,
  TrendingUp,
  Percent,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { notifyBackendRequired } from "../utils/backendRequired";

interface CommissionRule {
  id: string;
  category: string;
  currentRate: number;
  previousRate: number;
  status: "active" | "pending" | "inactive";
  lastUpdated: string;
  monthlyRevenue: number;
  monthlyCommission: number;
}

const commissionRulesData: CommissionRule[] = [
  {
    id: "CR-001",
    category: "Home Maintenance & Repair",
    currentRate: 12,
    previousRate: 10,
    status: "active",
    lastUpdated: "2026-02-15",
    monthlyRevenue: 1250000,
    monthlyCommission: 150000,
  },
  {
    id: "CR-002",
    category: "Beauty Wellness & Personal Care",
    currentRate: 15,
    previousRate: 15,
    status: "active",
    lastUpdated: "2026-01-20",
    monthlyRevenue: 850000,
    monthlyCommission: 127500,
  },
  {
    id: "CR-003",
    category: "Domestic & Cleaning Services",
    currentRate: 10,
    previousRate: 8,
    status: "active",
    lastUpdated: "2026-02-28",
    monthlyRevenue: 980000,
    monthlyCommission: 98000,
  },
  {
    id: "CR-004",
    category: "Pet Services",
    currentRate: 18,
    previousRate: 18,
    status: "active",
    lastUpdated: "2026-01-10",
    monthlyRevenue: 450000,
    monthlyCommission: 81000,
  },
  {
    id: "CR-005",
    category: "Events & Entertainment",
    currentRate: 20,
    previousRate: 18,
    status: "active",
    lastUpdated: "2026-03-01",
    monthlyRevenue: 2100000,
    monthlyCommission: 420000,
  },
  {
    id: "CR-006",
    category: "Automotive & Tech Support",
    currentRate: 14,
    previousRate: 14,
    status: "active",
    lastUpdated: "2025-12-15",
    monthlyRevenue: 670000,
    monthlyCommission: 93800,
  },
  {
    id: "CR-007",
    category: "Education & Professional Services",
    currentRate: 16,
    previousRate: 15,
    status: "active",
    lastUpdated: "2026-02-20",
    monthlyRevenue: 540000,
    monthlyCommission: 86400,
  },
  {
    id: "CR-008",
    category: "Health & Fitness",
    currentRate: 13,
    previousRate: 12,
    status: "active",
    lastUpdated: "2026-02-10",
    monthlyRevenue: 720000,
    monthlyCommission: 93600,
  },
];

const stats = [
  {
    title: "Average Commission Rate",
    value: "14.75%",
    change: "+1.2% vs last month",
    icon: Percent,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Total Monthly Commission",
    value: "₱1.15M",
    change: "+18.5% vs last month",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Active Categories",
    value: "8",
    change: "All categories operational",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Pending Changes",
    value: "0",
    change: "All rules updated",
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

export function CommissionRules() {
  const [rules, setRules] = useState<CommissionRule[]>(commissionRulesData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleEdit = (rule: CommissionRule) => {
    setEditingId(rule.id);
    setEditValue(rule.currentRate.toString());
  };

  const handleSave = (ruleId: string) => {
    const newRate = parseFloat(editValue);
    if (isNaN(newRate) || newRate < 0 || newRate > 100) {
      toast.error("Please enter a valid percentage between 0 and 100");
      return;
    }

    notifyBackendRequired(
      "Updating commission rules",
      "PATCH /v1/admin/commission-rules/:id",
    );
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Active
        </Badge>
      );
    }
    if (status === "pending") {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          Pending
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
        Inactive
      </Badge>
    );
  };

  const totalMonthlyRevenue = rules.reduce((sum, rule) => sum + rule.monthlyRevenue, 0);
  const totalMonthlyCommission = rules.reduce((sum, rule) => sum + rule.monthlyCommission, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commission Rules</h1>
        <p className="text-gray-500 mt-1">
          Configure and manage commission rates for each service category
        </p>
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

      {/* Commission Rules Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Category Commission Rates</CardTitle>
            <Badge variant="outline" className="text-sm">
              {rules.length} Categories
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Rate</TableHead>
                  <TableHead>Previous Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Monthly Revenue</TableHead>
                  <TableHead>Monthly Commission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <span className="font-medium text-gray-900">{rule.category}</span>
                    </TableCell>
                    <TableCell>
                      {editingId === rule.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20"
                          />
                          <span className="text-gray-500">%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-600 text-lg">
                            {rule.currentRate}%
                          </span>
                          {rule.currentRate !== rule.previousRate && (
                            <Badge variant="outline" className="text-xs">
                              Updated
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">{rule.previousRate}%</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(rule.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{rule.lastUpdated}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        ₱{rule.monthlyRevenue.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        ₱{rule.monthlyCommission.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingId === rule.id ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(rule.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(rule)}
                          title="Edit Commission Rate"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₱{totalMonthlyRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Monthly Commission</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₱{totalMonthlyCommission.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Important Notice</p>
              <p className="text-sm text-amber-700 mt-1">
                Changes to commission rates will take effect immediately for new bookings.
                Existing bookings will maintain their original commission rate. Please ensure
                all service providers are notified of rate changes in accordance with your
                service agreements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
