import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useAuth } from "../contexts/AuthContext";
import {
  listAdminCommissionRules,
  updateAdminCommissionRule,
  type AdminCommissionRuleSummary,
} from "../../services/serveaseAdminApi";

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CommissionRules() {
  const { accessToken } = useAuth();
  const [rules, setRules] = useState<AdminCommissionRuleSummary[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadRules = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setLoadError(null);
    try {
      setRules(await listAdminCommissionRules(accessToken));
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load commission rules.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  const handleEdit = (rule: AdminCommissionRuleSummary) => {
    setEditingId(rule.id);
    setEditValue(rule.currentRate.toString());
  };

  const handleSave = async (ruleId: string) => {
    if (!accessToken) return;

    const newRate = parseFloat(editValue);
    if (isNaN(newRate) || newRate < 0 || newRate > 100) {
      toast.error("Please enter a valid percentage between 0 and 100");
      return;
    }

    try {
      const currentRule = rules.find((rule) => rule.id === ruleId);
      const updated = await updateAdminCommissionRule(accessToken, ruleId, {
        currentRate: newRate,
        status: currentRule?.status ?? "active",
      });
      setRules((current) =>
        current.map((rule) => (rule.id === updated.id ? updated : rule)),
      );
      setEditingId(null);
      setEditValue("");
      toast.success(`${updated.categoryLabel} commission updated.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update commission rule.",
      );
    }
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
  const averageRate = rules.length
    ? rules.reduce((sum, rule) => sum + rule.currentRate, 0) / rules.length
    : 0;
  const activeCount = rules.filter((rule) => rule.status === "active").length;
  const pendingCount = rules.filter((rule) => rule.status === "pending").length;

  const stats = useMemo(
    () => [
      {
        title: "Average Commission Rate",
        value: `${averageRate.toFixed(2)}%`,
        change: "Backend configured",
        icon: Percent,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Total Monthly Commission",
        value: `₱${totalMonthlyCommission.toLocaleString()}`,
        change: "From active rule data",
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Active Categories",
        value: String(activeCount),
        change: `${rules.length} rules total`,
        icon: TrendingUp,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        title: "Pending Changes",
        value: String(pendingCount),
        change: "Awaiting activation",
        icon: AlertCircle,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
    ],
    [activeCount, averageRate, pendingCount, rules.length, totalMonthlyCommission],
  );

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
          {loadError ? <p className="text-sm text-red-600 mt-2">{loadError}</p> : null}
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Loading commission rules...
                    </TableCell>
                  </TableRow>
                ) : rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No commission rules found
                    </TableCell>
                  </TableRow>
                ) : rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <span className="font-medium text-gray-900">{rule.categoryLabel}</span>
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
                      <span className="text-sm text-gray-600">{formatDate(rule.updatedAt)}</span>
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
                            onClick={() => void handleSave(rule.id)}
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
