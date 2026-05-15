import Link from "next/link";

import { UserSwitcher } from "./user-switcher";

export function Header() {
  return (
    <header className="bg-card sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-primary text-lg font-semibold tracking-tight"
        >
          Issue Tracker
        </Link>
        <UserSwitcher />
      </div>
    </header>
  );
}
