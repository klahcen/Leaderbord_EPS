import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeToggle } from "@/components/providers/ThemeProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AIChatWidget } from "@/components/ai/AIChatWidget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0">
        <div className="dashboard-topbar">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <main className="dashboard-content flex-1 overflow-auto">{children}</main>
      </div>
      <AIChatWidget />
    </div>
  );
}
