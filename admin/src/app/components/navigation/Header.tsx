import { FormEvent, useMemo, useState } from "react";
import { Bell, Search, User, LogOut, Settings, ClipboardList, ChevronDown } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";
import { SignOutModal } from "../SignOutModal";
import { useAdminGatewayData } from "../../../hooks/useAdminGatewayData";

const routeSearchIndex = [
  { path: "/dashboard", label: "Dashboard", keywords: "overview home metrics" },
  { path: "/customers", label: "Customers", keywords: "users customer list" },
  { path: "/service-providers", label: "Service Providers", keywords: "providers listings vendors" },
  { path: "/provider-applications", label: "Approval Queue", keywords: "applications kyc review provider approval" },
  { path: "/bookings", label: "All Bookings", keywords: "booking reservations jobs" },
  { path: "/ongoing-services", label: "Ongoing Services", keywords: "active jobs live operations" },
  { path: "/disputes", label: "Disputes", keywords: "resolution conflict refund cases" },
  { path: "/support", label: "Support", keywords: "tickets help messages" },
  { path: "/transactions", label: "Transactions", keywords: "payments finance" },
  { path: "/failed-payments", label: "Failed Payments", keywords: "cancelled refunded exceptions" },
  { path: "/categories", label: "Categories", keywords: "catalog category marketplace" },
  { path: "/services", label: "Services", keywords: "catalog services price" },
  { path: "/reports/revenue", label: "Revenue", keywords: "reports analytics financial" },
  { path: "/backend-support", label: "Backend Matrix", keywords: "backend endpoints support blocked wired" },
  { path: "/settings", label: "Settings", keywords: "preferences account" },
];

export function Header() {
  const { admin, logout } = useAuth();
  const adminGateway = useAdminGatewayData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const handleLogout = () => {
    setIsSignOutModalOpen(false);
    logout();
    navigate("/login");
  };

  const handleNavigate = (path: string) => {
    setShowProfileMenu(false);
    setShowNotifications(false);
    navigate(path);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const match = routeSearchIndex.find((item) =>
      `${item.label} ${item.keywords}`.toLowerCase().includes(query),
    );
    if (match) {
      navigate(match.path);
    }
  };

  const notifications = useMemo(() => {
    const openTickets = adminGateway.supportTickets
      .filter((ticket) => ticket.status === "open" || ticket.status === "in_progress")
      .slice(0, 3)
      .map((ticket) => ({
        id: `ticket-${ticket.id}`,
        title: "Support ticket needs attention",
        message: `${ticket.subject} (${ticket.status.replace("_", " ")})`,
        time: ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "No date",
        unread: true,
        path: "/support",
      }));

    const paymentExceptions = adminGateway.payments
      .filter((payment) => payment.status === "cancelled" || payment.status === "refunded")
      .slice(0, 2)
      .map((payment) => ({
        id: `payment-${payment.id}`,
        title: "Payment exception",
        message: `${payment.id} is ${payment.status} for ₱${payment.amount.toLocaleString("en-PH")}`,
        time: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "No date",
        unread: true,
        path: "/failed-payments",
      }));

    if (adminGateway.isLoading) {
      return [
        {
          id: "loading",
          title: "Loading gateway notifications",
          message: "Reading support tickets and payment exceptions.",
          time: "Now",
          unread: false,
          path: "/dashboard",
        },
      ];
    }

    const liveItems = [...openTickets, ...paymentExceptions];
    return liveItems.length > 0
      ? liveItems
      : [
          {
            id: "clear",
            title: "No live admin alerts",
            message: "Gateway payments and support tickets have no open exceptions.",
            time: "Now",
            unread: false,
            path: "/dashboard",
          },
        ];
  }, [adminGateway.isLoading, adminGateway.payments, adminGateway.supportTickets]);

  const unreadNotificationCount = notifications.filter((notification) => notification.unread).length;

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Search Bar */}
      <form className="flex-1 max-w-2xl" onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search routes, endpoints, payments, support..."
            className="pl-9 bg-gray-50 border-gray-200 h-10"
          />
        </div>
      </form>

      {/* Right Section */}
      <div className="flex items-center gap-3 ml-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:bg-[#DCFCE7] hover:text-[#00BF63] rounded-lg transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#00BF63] text-white text-xs border-2 border-white">
                {unreadNotificationCount}
              </Badge>
            )}
          </button>

          {/* Dropdown Menu */}
          {showNotifications && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  <button
                    onClick={() => handleNavigate("/backend-support")}
                    className="text-xs text-[#00BF63] hover:text-[#00A055] font-medium cursor-pointer"
                  >
                    Matrix
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNavigate(notification.path)}
                      className={`w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-[#DCFCE7] transition-colors cursor-pointer ${
                        notification.unread ? "bg-green-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          notification.unread ? "bg-[#00BF63]" : "bg-gray-300"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-gray-100">
                  <button
                    onClick={() => handleNavigate("/support")}
                    className="w-full text-center text-sm text-[#00BF63] hover:text-[#00A055] font-medium cursor-pointer"
                  >
                    View support tickets
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-4 py-2 pr-3 border-l border-gray-200 hover:bg-[#DCFCE7] rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 bg-[#00BF63] rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-900">{admin?.name || "Admin User"}</p>
              <p className="text-xs text-gray-500">{admin?.role || "Super Admin"}</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                showProfileMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{admin?.name || "Admin User"}</p>
                  <p className="text-xs text-gray-500">{admin?.email || "admin@servease.ph"}</p>
                </div>

                <div className="py-1">
                  <button 
                    onClick={() => handleNavigate("/profile")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#DCFCE7] hover:text-[#00BF63] transition-colors cursor-pointer text-left"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </button>
                  <button 
                    onClick={() => handleNavigate("/settings")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#DCFCE7] hover:text-[#00BF63] transition-colors cursor-pointer text-left"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button 
                    onClick={() => handleNavigate("/audit-trail")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#DCFCE7] hover:text-[#00BF63] transition-colors cursor-pointer text-left"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Activity Log
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsSignOutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sign Out Modal */}
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
}
