import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardAlerts } from "@/components/dashboard-alerts";
import { BotStatsProvider } from "@/context/BotStatsContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Layout() {
  return (
    <BotStatsProvider>
      <NotificationsProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-h-svh bg-background">
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
            <DashboardAlerts />
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      </NotificationsProvider>
    </BotStatsProvider>
  );
}
