import { StatusBar } from "../components/StatusBar";
import { BackButton } from "../components/BackButton";
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Target,
  Award,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProviderPerformanceInsights() {
  // Sample data for the trend graph
  const trendData = [
    { day: "Day 1", score: 82 },
    { day: "Day 5", score: 85 },
    { day: "Day 10", score: 83 },
    { day: "Day 15", score: 88 },
    { day: "Day 20", score: 86 },
    { day: "Day 25", score: 89 },
    { day: "Day 30", score: 87 },
  ];

  const keyMetrics = [
    {
      label: "Acceptance Rate",
      value: "92%",
      icon: CheckCircle,
      color: "#56C490",
    },
    {
      label: "Completion Rate",
      value: "95%",
      icon: Target,
      color: "#56C490",
    },
    {
      label: "Cancellation Rate",
      value: "3%",
      icon: XCircle,
      color: "#DC2626",
    },
    {
      label: "Avg Response Time",
      value: "12 min",
      icon: Clock,
      color: "#F59E0B",
    },
    {
      label: "Customer Satisfaction",
      value: "4.8/5.0",
      icon: Star,
      color: "#FFA500",
    },
    {
      label: "On-Time Arrival Rate",
      value: "89%",
      icon: ThumbsUp,
      color: "#56C490",
    },
  ];

  const comparisons = [
    { label: "Acceptance Rate", you: 92, average: 85 },
    { label: "Completion Rate", you: 95, average: 88 },
    { label: "Customer Satisfaction", you: 96, average: 82 },
    { label: "On-Time Arrival", you: 89, average: 78 },
  ];

  const improvements = [
    "Respond to booking requests within 10 minutes to improve acceptance rate",
    "Maintain consistent communication with customers throughout service",
    "Arrive 5-10 minutes early to boost on-time arrival score",
    "Follow up with customers after service completion for better ratings",
  ];

  const topProviderRequirements = [
    { label: "Overall Rating", current: 4.8, required: 4.7, status: "complete" },
    { label: "Acceptance Rate", current: 92, required: 90, status: "complete" },
    { label: "Completion Rate", current: 95, required: 85, status: "complete" },
    { label: "Services Completed", current: 127, required: 100, status: "complete" },
  ];

  const performanceScore = 87;
  const maxScore = 100;
  const scorePercentage = (performanceScore / maxScore) * 100;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  return (
    <div className="h-screen bg-[#F9FAFB] flex flex-col overflow-hidden">
      {/* iOS Status Bar */}
      <StatusBar />

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center justify-between h-[56px] px-[24px]">
          <BackButton />
          <h1 className="font-bold text-[20px] text-[#111827]">
            Performance Insights
          </h1>
          <div className="w-[40px]" /> {/* Spacer */}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[20px]">
        {/* Performance Score Card */}
        <div className="bg-white rounded-[16px] shadow-sm p-[24px] mb-[16px]">
          <div className="flex flex-col items-center">
            {/* Circular Progress */}
            <div className="relative w-[180px] h-[180px] mb-[16px]">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="16"
                />
                {/* Progress circle */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#56C490"
                  strokeWidth="16"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Score in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[48px] font-bold text-[#111827]">
                  {performanceScore}
                </span>
                <span className="text-[16px] text-[#6B7280]">out of {maxScore}</span>
              </div>
            </div>
            <h3 className="text-[18px] font-bold text-[#111827] mb-[4px]">
              Overall Performance
            </h3>
            <p className="text-[14px] text-[#6B7280] text-center">
              You're performing better than 78% of providers in your category
            </p>
          </div>
        </div>

        {/* Key Metrics Card */}
        <div className="bg-white rounded-[16px] shadow-sm p-[20px] mb-[16px]">
          <h3 className="text-[18px] font-bold text-[#111827] mb-[16px]">
            Key Metrics
          </h3>
          <div className="space-y-[12px]">
            {keyMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-[16px] bg-[#F9FAFB] rounded-[12px]"
                >
                  <div className="flex items-center gap-[12px]">
                    <div
                      className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center"
                      style={{ backgroundColor: `${metric.color}15` }}
                    >
                      <Icon
                        className="w-[20px] h-[20px]"
                        style={{ color: metric.color }}
                      />
                    </div>
                    <span className="text-[15px] text-[#535353] font-medium">
                      {metric.label}
                    </span>
                  </div>
                  <span className="text-[18px] font-bold text-[#111827]">
                    {metric.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison to Category Average */}
        <div className="bg-white rounded-[16px] shadow-sm p-[20px] mb-[16px]">
          <h3 className="text-[18px] font-bold text-[#111827] mb-[4px]">
            Comparison to Category Average
          </h3>
          <p className="text-[14px] text-[#6B7280] mb-[20px]">
            See how you stack up against other providers
          </p>
          <div className="space-y-[20px]">
            {comparisons.map((comparison, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-[8px]">
                  <span className="text-[14px] font-semibold text-[#111827]">
                    {comparison.label}
                  </span>
                  <div className="flex items-center gap-[16px]">
                    <div className="flex items-center gap-[6px]">
                      <span className="text-[12px] text-[#6B7280]">You</span>
                      <span className="text-[14px] font-bold text-[#56C490]">
                        {comparison.you}%
                      </span>
                    </div>
                    <div className="flex items-center gap-[6px]">
                      <span className="text-[12px] text-[#6B7280]">Avg</span>
                      <span className="text-[14px] font-medium text-[#9CA3AF]">
                        {comparison.average}%
                      </span>
                    </div>
                  </div>
                </div>
                {/* Progress bars container */}
                <div className="space-y-[4px]">
                  {/* Your bar */}
                  <div className="relative h-[8px] bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-[#56C490] rounded-full transition-all duration-500"
                      style={{ width: `${comparison.you}%` }}
                    />
                  </div>
                  {/* Average bar */}
                  <div className="relative h-[6px] bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-[#9CA3AF] rounded-full transition-all duration-500"
                      style={{ width: `${comparison.average}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trends Graph */}
        <div className="bg-white rounded-[16px] shadow-sm p-[20px] mb-[16px]">
          <h3 className="text-[18px] font-bold text-[#111827] mb-[4px]">
            Performance Trends
          </h3>
          <p className="text-[14px] text-[#6B7280] mb-[20px]">Last 30 Days</p>
          <div className="h-[200px] -ml-[20px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  domain={[75, 95]}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#56C490"
                  strokeWidth={3}
                  dot={{ fill: "#56C490", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-[16px] shadow-sm p-[20px] mb-[16px]">
          <div className="flex items-center gap-[8px] mb-[16px]">
            <TrendingUp className="w-[20px] h-[20px] text-[#56C490]" />
            <h3 className="text-[18px] font-bold text-[#111827]">
              Areas for Improvement
            </h3>
          </div>
          <div className="space-y-[12px]">
            {improvements.map((tip, index) => (
              <div
                key={index}
                className="flex gap-[12px] p-[16px] bg-[#F0FDF4] border border-[#BBF7D0] rounded-[12px]"
              >
                <AlertCircle className="w-[20px] h-[20px] text-[#56C490] shrink-0 mt-[2px]" />
                <p className="text-[14px] text-[#065F46] leading-[1.5]">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Provider Status */}
        <div className="bg-gradient-to-br from-[#56C490] to-[#059669] rounded-[16px] shadow-sm p-[24px] mb-[16px]">
          <div className="flex items-start justify-between mb-[20px]">
            <div>
              <div className="flex items-center gap-[8px] mb-[8px]">
                <Award className="w-[24px] h-[24px] text-white" />
                <h3 className="text-[20px] font-bold text-white">
                  Top Provider Status
                </h3>
              </div>
              <p className="text-[14px] text-white/90">
                You've earned Top Provider status!
              </p>
            </div>
            <div className="w-[48px] h-[48px] bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Award className="w-[28px] h-[28px] text-white" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-[12px] p-[16px] mb-[16px]">
            <p className="text-[13px] text-white/80 mb-[12px] font-medium">
              Requirements Progress
            </p>
            <div className="space-y-[12px]">
              {topProviderRequirements.map((req, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-[6px]">
                    <span className="text-[13px] text-white font-medium">
                      {req.label}
                    </span>
                    <div className="flex items-center gap-[6px]">
                      <span className="text-[13px] text-white font-bold">
                        {req.current}
                      </span>
                      <span className="text-[12px] text-white/70">
                        / {req.required}
                      </span>
                      {req.status === "complete" && (
                        <CheckCircle className="w-[14px] h-[14px] text-white" />
                      )}
                    </div>
                  </div>
                  <div className="h-[6px] bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (req.current / req.required) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-[8px] p-[12px] bg-white/10 backdrop-blur-sm rounded-[12px]">
            <CheckCircle className="w-[18px] h-[18px] text-white" />
            <span className="text-[14px] text-white font-semibold">
              All requirements met! Keep up the great work!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
