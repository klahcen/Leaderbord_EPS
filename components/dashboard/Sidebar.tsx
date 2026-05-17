"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Trophy,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/Logo";

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/dashboard/students", label: t("students"), icon: Users },
    { href: "/dashboard/progress", label: t("progress"), icon: ClipboardList },
    { href: "/leaderboard", label: t("leaderboard"), icon: Trophy },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <aside className="sidebar hidden md:flex">
        <Logo
          href="/dashboard"
          size="md"
          showText
          variant="onDark"
          className="sidebar-brand"
          priority
        />
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn("nav-item", isActive(href) && "active")}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4">
          <button
            type="button"
            className="nav-item w-full border-0 bg-transparent"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {t("logout")}
          </button>
        </div>
      </aside>

      <nav className="mobile-nav md:hidden">
        {navItems.map(({ href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn("mobile-nav-item", isActive(href) && "active")}
          >
            <Icon />
          </Link>
        ))}
      </nav>
    </>
  );
}
