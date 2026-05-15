import { SidebarTrigger } from "@/components/ui/sidebar";

import { UserSwitcher } from "./user-switcher";

export function Header() {
  return (
    <header className="bg-muted sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <div className="ml-auto">
        <UserSwitcher />
      </div>
    </header>
  );
}
