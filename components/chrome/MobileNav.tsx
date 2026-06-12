"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, BarChart3, FileText, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCity } from "@/providers/CityProvider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const TABS = [
  { href: "", label: "Dashboard", icon: BarChart3 },
  { href: "/explore", label: "Explore", icon: Map },
  { href: "/issues", label: "Issues", icon: FileText },
];

const MORE = [
  { href: "/infrastructure", label: "Infrastructure" },
  { href: "/safety", label: "Safety" },
  { href: "/community", label: "Community" },
  { href: "/compare", label: "Compare" },
  { href: "/methodology", label: "About" },
];

export function MobileNav() {
  const pathname = usePathname();
  const city = useCity();
  const base = `/${city.slug}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-white/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {TABS.map((tab) => {
          const href = `${base}${tab.href}`;
          const active =
            tab.href === ""
              ? pathname === base || pathname === `${base}/`
              : pathname.startsWith(href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs",
                active ? "font-medium text-indigo-600" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
        <Sheet>
          <SheetTrigger className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
            <MoreHorizontal className="h-5 w-5" />
            More
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>More sections</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-2 py-4">
              {MORE.map((item) => (
                <Link
                  key={item.href}
                  href={`${base}${item.href}`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background text-sm hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
