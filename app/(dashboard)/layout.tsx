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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="flex items-center justify-end gap-3 border-b px-6 py-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="p-6">{children}</div>
      </main>
      <AIChatWidget />
    </div>
  );
}
