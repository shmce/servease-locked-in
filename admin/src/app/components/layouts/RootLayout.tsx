import { Outlet } from "react-router";
import { Sidebar } from "../navigation/Sidebar";
import { Header } from "../navigation/Header";
import { DataProvider } from "../../../contexts/DataContext";
import { Toaster } from "../ui/sonner";
import { usePersistentState } from "../../../hooks/usePersistentState";

export function RootLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = usePersistentState(
    "servease_admin_sidebar_collapsed",
    false,
  );

  return (
    <DataProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar - Fixed position, scrollable independently */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          {/* Header - Sticky at top */}
          <Header />

          {/* Page Content - Scrollable */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-[1600px] mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </DataProvider>
  );
}
