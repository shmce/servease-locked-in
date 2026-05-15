import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { 
  ArrowLeft, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Download, 
  TrendingUp,
  Home, 
  MessageCircle, 
  MoreHorizontal,
  Calendar,
  CreditCard,
  FileText,
  Briefcase,
  CircleDollarSign,
  Wallet
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

export default function ProviderEarnings() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "all">("month");

  // Sample data for bar/line chart
  const earningsTrendData = [
    { id: "1", date: "Mar 6", amount: 1870 },
    { id: "2", date: "Mar 7", amount: 1425 },
    { id: "3", date: "Mar 8", amount: 3020 },
    { id: "4", date: "Mar 9", amount: 1530 },
    { id: "5", date: "Mar 10", amount: 2325 },
    { id: "6", date: "Mar 11", amount: 2850 },
    { id: "7", date: "Mar 12", amount: 3100 },
  ];

  // Sample data for pie chart
  const serviceCategoryData = [
    { name: "House Cleaning", value: 4500, color: "#00BF63" },
    { name: "Plumbing", value: 3200, color: "#059669" },
    { name: "Electrical", value: 2800, color: "#10B981" },
    { name: "Aircon Services", value: 1950, color: "#34D399" },
  ];

  // Top earning days data
  const topEarningDays = [
    { day: "Monday", amount: 3200, percentage: 100 },
    { day: "Wednesday", amount: 2850, percentage: 89 },
    { day: "Saturday", amount: 2650, percentage: 83 },
    { day: "Friday", amount: 2100, percentage: 66 },
  ];

  const totalEarnings = selectedPeriod === "month" ? 12450 : 42300;
  const pendingEarnings = 1530;
  const inProcessing = 850;
  const paidOut = 10920;
  const completedBookings = 47;
  const avgBookingValue = 2650;
  const totalTips = 1340;
  const platformFees = 1868;

  return (
    <div className="bg-[#F9FAFB] w-full h-screen flex flex-col">
      {/* Fixed iOS Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex-shrink-0">
        <StatusBar />
      </div>

      {/* Fixed Header */}
      <div className="fixed top-[47px] left-0 right-0 z-40 bg-white border-b border-[#E5E7EB] px-[24px] py-[12px] flex-shrink-0">
        <div className="flex items-center gap-[12px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center -ml-[8px] transition-all active:scale-90"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#111827]" />
          </button>
          <h1 className="font-semibold text-[18px] text-[#111827]">
            Earnings Dashboard
          </h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="mt-[106px] mb-[34px] overflow-y-scroll">
        {/* Period Selector - Pill Style */}
        <div className="px-[24px] pt-[20px] pb-[16px] bg-white">
          <div className="flex gap-[8px] p-[4px] bg-[#F3F4F6] rounded-[12px]">
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "This Week" },
              { key: "month", label: "This Month" },
              { key: "all", label: "All Time" },
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key as any)}
                className={`flex-1 py-[8px] rounded-[8px] font-medium text-[13px] transition-all ${
                  selectedPeriod === period.key
                    ? "bg-[#00BF63] text-white shadow-sm"
                    : "bg-transparent text-[#6B7280]"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Total Earnings */}
        <div className="px-[24px] pb-[20px] bg-white border-b border-[#E5E7EB]">
          <div className="text-center py-[8px]">
            <p className="text-[14px] text-[#6B7280] mb-[8px]">Total Earnings</p>
            <div className="flex items-center justify-center gap-[8px]">
              <h2 className="font-bold text-[42px] text-[#00BF63] tracking-tight">
                ₱{totalEarnings.toLocaleString()}
              </h2>
              <div className="flex items-center gap-[4px] px-[8px] py-[4px] bg-[#00BF63]/10 rounded-[8px]">
                <TrendingUp className="w-[14px] h-[14px] text-[#00BF63]" />
                <span className="text-[12px] font-semibold text-[#00BF63]">+12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Earnings Trend Chart */}
        <div className="px-[24px] pt-[20px] pb-[16px] bg-white">
          <h3 className="font-semibold text-[16px] text-[#111827] mb-[16px]">
            Earnings Trend
          </h3>
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-[16px]">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={earningsTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  stroke="#E5E7EB"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  stroke="#E5E7EB"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`₱${value}`, 'Earnings']}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#00BF63" 
                  strokeWidth={3}
                  dot={{ fill: '#00BF63', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payout Status Row - 3 Cards */}
        <div className="px-[24px] pt-[20px] pb-[16px] bg-[#F9FAFB]">
          <h3 className="font-semibold text-[16px] text-[#111827] mb-[12px]">
            Payout Status
          </h3>
          <div className="grid grid-cols-3 gap-[8px]">
            {/* Pending */}
            <div className="bg-white rounded-[12px] p-[12px] border border-[#E5E7EB]">
              <div className="w-[32px] h-[32px] rounded-[8px] bg-[#FEF3C7] flex items-center justify-center mb-[8px]">
                <Clock className="w-[16px] h-[16px] text-[#F59E0B]" />
              </div>
              <p className="text-[10px] text-[#6B7280] mb-[4px]">Pending</p>
              <p className="font-bold text-[16px] text-[#111827]">₱{pendingEarnings.toLocaleString()}</p>
            </div>

            {/* In Processing */}
            <div className="bg-white rounded-[12px] p-[12px] border border-[#E5E7EB]">
              <div className="w-[32px] h-[32px] rounded-[8px] bg-[#DBEAFE] flex items-center justify-center mb-[8px]">
                <CreditCard className="w-[16px] h-[16px] text-[#3B82F6]" />
              </div>
              <p className="text-[10px] text-[#6B7280] mb-[4px]">Processing</p>
              <p className="font-bold text-[16px] text-[#111827]">₱{inProcessing.toLocaleString()}</p>
            </div>

            {/* Paid Out */}
            <div className="bg-white rounded-[12px] p-[12px] border border-[#E5E7EB]">
              <div className="w-[32px] h-[32px] rounded-[8px] bg-[#D1FAE5] flex items-center justify-center mb-[8px]">
                <CheckCircle className="w-[16px] h-[16px] text-[#00BF63]" />
              </div>
              <p className="text-[10px] text-[#6B7280] mb-[4px]">Paid Out</p>
              <p className="font-bold text-[16px] text-[#111827]">₱{paidOut.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Primary Actions - Request Payout & Download Statement */}
        <div className="px-[24px] pb-[20px] bg-[#F9FAFB]">
          <div className="grid grid-cols-2 gap-[12px]">
            <button 
              onClick={() => navigate("/provider/payout-management")}
              className="bg-[#00BF63] py-[14px] rounded-[12px] flex items-center justify-center gap-[8px] shadow-[0_2px_8px_rgba(0,191,99,0.25)] transition-all active:scale-95"
            >
              <Wallet className="w-[18px] h-[18px] text-white" />
              <span className="font-semibold text-[14px] text-white">Request Payout</span>
            </button>
            <button className="bg-white border-2 border-[#E5E7EB] py-[14px] rounded-[12px] flex items-center justify-center gap-[8px] transition-all active:scale-95">
              <Download className="w-[18px] h-[18px] text-[#374151]" />
              <span className="font-semibold text-[14px] text-[#374151]">Download</span>
            </button>
          </div>
        </div>

        {/* Metric Grid - 2x2 */}
        <div className="px-[24px] pt-[20px] pb-[16px] bg-[#F9FAFB]">
          <h3 className="font-semibold text-[16px] text-[#111827] mb-[12px]">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-2 gap-[12px]">
            {/* Completed Bookings */}
            <div className="bg-white rounded-[12px] p-[16px] border border-[#E5E7EB]">
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className="w-[36px] h-[36px] rounded-[8px] bg-[#EEF2FF] flex items-center justify-center">
                  <Briefcase className="w-[18px] h-[18px] text-[#6366F1]" />
                </div>
                <p className="text-[12px] text-[#6B7280]">Completed</p>
              </div>
              <p className="font-bold text-[24px] text-[#111827]">{completedBookings}</p>
              <p className="text-[11px] text-[#9CA3AF]">Bookings</p>
            </div>

            {/* Average Booking Value */}
            <div className="bg-white rounded-[12px] p-[16px] border border-[#E5E7EB]">
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className="w-[36px] h-[36px] rounded-[8px] bg-[#FEF3C7] flex items-center justify-center">
                  <CircleDollarSign className="w-[18px] h-[18px] text-[#F59E0B]" />
                </div>
                <p className="text-[12px] text-[#6B7280]">Avg. Value</p>
              </div>
              <p className="font-bold text-[24px] text-[#111827]">₱{avgBookingValue.toLocaleString()}</p>
              <p className="text-[11px] text-[#9CA3AF]">Per Booking</p>
            </div>

            {/* Total Tips */}
            <div className="bg-white rounded-[12px] p-[16px] border border-[#E5E7EB]">
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className="w-[36px] h-[36px] rounded-[8px] bg-[#D1FAE5] flex items-center justify-center">
                  <DollarSign className="w-[18px] h-[18px] text-[#00BF63]" />
                </div>
                <p className="text-[12px] text-[#6B7280]">Total Tips</p>
              </div>
              <p className="font-bold text-[24px] text-[#111827]">₱{totalTips.toLocaleString()}</p>
              <p className="text-[11px] text-[#00BF63]">+8% vs last period</p>
            </div>

            {/* Platform Fees */}
            <div className="bg-white rounded-[12px] p-[16px] border border-[#E5E7EB]">
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center">
                  <FileText className="w-[18px] h-[18px] text-[#6B7280]" />
                </div>
                <p className="text-[12px] text-[#6B7280]">Platform Fees</p>
              </div>
              <p className="font-bold text-[24px] text-[#9CA3AF]">₱{platformFees.toLocaleString()}</p>
              <p className="text-[11px] text-[#9CA3AF]">15% of total</p>
            </div>
          </div>
        </div>

        {/* Service Category Breakdown - Pie Chart */}
        <div className="px-[24px] pt-[20px] pb-[16px] bg-[#F9FAFB]">
          <h3 className="font-semibold text-[16px] text-[#111827] mb-[12px]">
            Earnings by Service Category
          </h3>
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-[16px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={serviceCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceCategoryData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`₱${value}`, 'Earnings']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-[8px] mt-[12px]">
              {serviceCategoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-[6px]">
                  <div 
                    className="w-[12px] h-[12px] rounded-[3px]" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] text-[#6B7280]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Earning Days */}
        <div className="px-[24px] pt-[20px] pb-[24px] bg-[#F9FAFB]">
          <h3 className="font-semibold text-[16px] text-[#111827] mb-[12px]">
            Top Earning Days
          </h3>
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-[16px] space-y-[12px]">
            {topEarningDays.map((item, index) => (
              <div key={item.day}>
                <div className="flex items-center justify-between mb-[6px]">
                  <div className="flex items-center gap-[8px]">
                    <span className="font-semibold text-[13px] text-[#374151]">{item.day}</span>
                    <span className="text-[12px] text-[#6B7280]">₱{item.amount.toLocaleString()}</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#00BF63]">{item.percentage}%</span>
                </div>
                <div className="w-full h-[6px] bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00BF63] to-[#059669] rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Efficiency Tip */}
          <div className="mt-[12px] bg-[#E8F5E9] border border-[#00BF63]/20 rounded-[12px] p-[14px]">
            <div className="flex gap-[10px]">
              <div className="w-[36px] h-[36px] rounded-[8px] bg-[#00BF63]/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-[18px] h-[18px] text-[#00BF63]" />
              </div>
              <div>
                <p className="font-semibold text-[13px] text-[#111827] mb-[4px]">Efficiency Tip</p>
                <p className="text-[12px] text-[#374151] leading-[1.5]">
                  Your peak earning hours are <span className="font-semibold text-[#00BF63]">10 AM - 2 PM on weekdays</span>. 
                  Consider scheduling more availability during these times to maximize earnings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Spacer */}
        <div className="h-[40px]" />
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-[#F9FAFB] relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}