import { Outlet } from "react-router";
import { Sidebar } from "../navigation/Sidebar";
import { Header } from "../navigation/Header";
import { Toaster } from "../ui/sonner";
import { usePersistentState } from "../../../hooks/usePersistentState";

export function RootLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = usePersistentState(
    "servease_admin_sidebar_collapsed",
    false,
  );

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          <Header />

          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-[1600px] mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
}
