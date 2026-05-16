import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Package,
  LifeBuoy,
  CreditCard,
  TrendingUp,
  BarChart3,
  PieChart,
  UserPlus,
  Shield,
  Settings,
  Bell,
  FileText,
  PanelLeftClose,
  PanelLeft,
  ShoppingBag,
  Grid3x3,
  MapPin,
  Tag,
  Plug,
  Briefcase,
  DollarSign,
  Activity,
  CheckSquare,
  ClipboardList,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  Megaphone,
  Percent,
  Wallet,
  ServerCog,
  Star,
} from "lucide-react";
import logo from "../../../assets/d516c8a7c0636434620c64585c9fd8b4bb2db014.png";

interface SidebarItemProps {
  item: {
    to: string;
    icon: React.ElementType;
    label: string;
    end?: boolean;
  };
  isCollapsed: boolean;
}

function SidebarItem({ item, isCollapsed }: SidebarItemProps) {
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative ${
            isActive
              ? "bg-[#00BF63] text-white"
              : "text-gray-700 hover:bg-[#DCFCE7] hover:text-[#15803D]"
          }`
        }
        title={isCollapsed ? item.label : undefined}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        <span
          className={`text-sm font-medium transition-all duration-300 ${
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          }`}
        >
          {item.label}
        </span>

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </NavLink>
    </li>
  );
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const sections = [
    {
      title: "Dashboard",
      items: [
        { to: "/dashboard", icon: LayoutDashboard, label: "Overview", end: true },
      ],
    },
    {
      title: "User Management",
      items: [
        { to: "/customers",             icon: Users,         label: "Customers" },
        { to: "/service-providers",     icon: UserCheck,     label: "Service Providers" },
        { to: "/provider-applications", icon: UserPlus,      label: "Approval Queue" },
      ],
    },
    {
      title: "Operations",
      items: [
        { to: "/bookings",          icon: Package,       label: "All Bookings" },
        { to: "/ongoing-services",  icon: ClipboardList, label: "Ongoing Services" },
        { to: "/disputes",          icon: LifeBuoy,      label: "Disputes" },
        { to: "/support",           icon: HelpCircle,    label: "Support" },
        { to: "/reviews",           icon: Star,          label: "Reviews" },
      ],
    },
    {
      title: "Finance",
      items: [
        { to: "/transactions",      icon: CreditCard,  label: "Transactions" },
        { to: "/provider-earnings", icon: Wallet,      label: "Provider Earnings" },
        { to: "/payout-requests",   icon: TrendingUp,  label: "Payout Requests" },
        { to: "/refund-management", icon: RefreshCw,   label: "Refund Management" },
        { to: "/failed-payments",   icon: AlertCircle, label: "Failed Payments" },
      ],
    },
    {
      title: "Marketplace & Marketing",
      items: [
        { to: "/categories",    icon: Grid3x3,    label: "Categories" },
        { to: "/services",      icon: ShoppingBag, label: "Services" },
        { to: "/service-areas", icon: MapPin,      label: "Service Areas" },
        { to: "/promotions",    icon: Tag,         label: "Promotions" },
        { to: "/broadcasts",    icon: Megaphone,   label: "Broadcasts" },
      ],
    },
    {
      title: "Reports & Analytics",
      items: [
        { to: "/reports/revenue",           icon: BarChart3,   label: "Revenue" },
        { to: "/reports/booking-analytics", icon: PieChart,    label: "Booking Analytics" },
        { to: "/reports/business",          icon: Briefcase,   label: "Business Reports" },
        { to: "/reports/financial",         icon: DollarSign,  label: "Financial Reports" },
        { to: "/reports/user",              icon: Users,       label: "User Reports" },
        { to: "/reports/performance",       icon: Activity,    label: "Performance Reports" },
        { to: "/reports/compliance",        icon: CheckSquare, label: "Compliance Reports" },
      ],
    },
    {
      title: "Platform Settings",
      items: [
        { to: "/commission-rules",       icon: Percent,    label: "Commission" },
        { to: "/admin-roles",            icon: Shield,     label: "Admin Roles & Permissions" },
        { to: "/security-settings",      icon: Settings,   label: "Security Settings" },
        { to: "/notification-settings",  icon: Bell,       label: "Notification Settings" },
        { to: "/audit-trail",            icon: FileText,   label: "Logs & Audit Trail" },
        { to: "/integrations",           icon: Plug,       label: "Integrations" },
        { to: "/backend-support",        icon: ServerCog,  label: "Backend Matrix" },
      ],
    },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-20 flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex flex-col items-center gap-2">
            <img
              src={logo.src}
              alt="ServEase"
              className="h-8 w-auto"
            />
            <p className="text-xs text-gray-500 whitespace-nowrap">Admin Dashboard</p>
          </div>
        )}
      </div>

      {/* Navigation - Scrollable */}
      <nav className="p-4 flex-1 overflow-y-auto">
        {sections.map((section, index) => (
          <div key={index} className="mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
            )}
            {isCollapsed && (
              <div className="h-px bg-gray-200 mb-2" />
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.to + item.label}
                  item={item}
                  isCollapsed={isCollapsed}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#DCFCE7] hover:text-[#15803D] transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <>
              <PanelLeftClose className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="text-xs text-gray-500 text-center">
            <p>ServEase Admin v2.0</p>
            <p className="mt-1">© 2026 ServEase Platform</p>
          </div>
        </div>
      )}
    </aside>
  );
}
