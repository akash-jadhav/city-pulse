"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCity } from "@/providers/CityProvider";

const NAV_ITEMS = [
  { href: "", label: "Overview" },
  { href: "/overview", label: "City" },
  { href: "/explore", label: "Explore" },
  { href: "/infrastructure", label: "Infrastructure" },
  { href: "/safety", label: "Safety" },
  { href: "/issues", label: "Issues" },
  { href: "/community", label: "Community" },
  { href: "/compare", label: "Compare" },
];

export function PrimaryNav() {
  const pathname = usePathname();
  const city = useCity();

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {NAV_ITEMS.map((item) => {
        const href = `/${city.slug}${item.href}`;
        const active =
          item.href === ""
            ? pathname === `/${city.slug}` || pathname === `/${city.slug}/`
            : pathname.startsWith(href);
        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
