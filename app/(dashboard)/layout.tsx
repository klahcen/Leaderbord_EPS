import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeToggle } from "@/components/providers/ThemeProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AIChatWidget } from "@/components/ai/AIChatWidget";
import { DeveloperLinks } from "@/components/DeveloperLinks";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        <div className="dashboard-topbar">
          <DeveloperLinks className="md:hidden" />
          <div className="dashboard-topbar-actions">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <main className="dashboard-content flex-1 overflow-x-hidden">{children}</main>
      </div>
      <AIChatWidget />
    </div>
  );
}
