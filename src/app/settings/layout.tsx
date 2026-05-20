"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settingsNav = [
  { href: "/settings/statuses", label: "Statuses" },
  { href: "/settings/types", label: "Types" },
  { href: "/settings/priorities", label: "Priorities" },
  { href: "/settings/severities", label: "Severities" },
  { href: "/settings/tags", label: "Tags" },
  { href: "/settings/due-dates", label: "Due Dates" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col lg:flex-row min-h-screen bg-background">
      <aside className="w-full lg:w-64 shrink-0 bg-sidebar-secondary/50 py-6 h-auto">
        <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible">
          {settingsNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 lg:flex-none flex items-center justify-center lg:justify-start px-6 py-3 text-sm font-medium transition-all text-muted-foreground hover:bg-sidebar-secondary hover:text-sidebar-foreground",
                  isActive &&
                    "bg-primary text-primary-foreground shadow-sm border-r-4 border-primary-foreground/30 hover:bg-primary/90 hover:text-primary-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
