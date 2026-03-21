"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PRIVATE_NAV_ITEMS = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/clients", label: "Clients" },
  { href: "/app/services", label: "Services" },
  { href: "/app/bookings", label: "Bookings" },
] as const;

export function PrivateNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Private navigation" className="border-t border-slate-200 bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-6 py-3">
        {PRIVATE_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
