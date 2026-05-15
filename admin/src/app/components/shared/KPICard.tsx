import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  sparklineData?: number[];
  status?: "success" | "warning" | "danger" | "info";
}

const statusColors = {
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: "text-emerald-600",
    line: "#10b981",
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: "text-amber-600",
    line: "#f59e0b",
  },
  danger: {
    bg: "bg-red-50",
    text: "text-red-700",
    icon: "text-red-600",
    line: "#ef4444",
  },
  info: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    icon: "text-gray-600",
    line: "#6b7280",
  },
};

export function KPICard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  sparklineData,
  status = "info",
}: KPICardProps) {
  const colors = statusColors[status];
  
  const chartData = sparklineData?.map((value, index) => ({
    value,
    index,
  })) || [];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          {sparklineData && sparklineData.length > 0 && (
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={colors.line}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${colors.text}`}>
              {change}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}