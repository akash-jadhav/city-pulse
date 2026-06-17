"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";
import { useAvailableCities, useCity } from "@/providers/CityProvider";
import { getCityDropdownLabel } from "@/config/cities/labels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const REPORT_LINKS = [
  { href: "/infrastructure", label: "Infrastructure" },
  { href: "/safety", label: "Safety" },
  { href: "/issues", label: "Civic Issues" },
  { href: "/community", label: "Community Voice" },
  { href: "/compare", label: "Compare" },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const city = useCity();
  const availableCities = useAvailableCities();
  const base = `/${city.slug}`;

  const subRoute = pathname.replace(/^\/[^/]+/, "") || "";

  const handleCityChange = (slug: string | null) => {
    if (!slug || slug === city.slug) return;
    router.push(`/${slug}${subRoute}`);
  };

  const navLink = (href: string, label: string, exact = false) => {
    const full = `${base}${href}`;
    const active = exact
      ? pathname === full || pathname === base
      : pathname.startsWith(full);
    return (
      <Link
        href={full}
        className={cn(
          "relative px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "text-indigo-600 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-indigo-600"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2.5 md:px-6">
        <Link href={base} className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
            <MapPin className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 max-w-[140px] truncate sm:max-w-none">
            <p className="truncate text-[13px] font-semibold leading-tight text-foreground sm:text-sm">
              {BRAND.name}
            </p>
            <p className="truncate text-[11px] font-medium text-muted-foreground">
              {BRAND.tagline}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center md:flex">
          {navLink("", "Dashboard", true)}
          {navLink("/explore", "Explore")}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-0.5 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Reports
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {REPORT_LINKS.map((item) => (
                <DropdownMenuItem key={item.href} className="p-0">
                  <Link
                    href={`${base}${item.href}`}
                    className="block w-full px-2 py-1.5"
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {navLink("/methodology", "About")}
        </nav>

        <div className="flex items-center gap-2">
          <Select value={city.slug} onValueChange={handleCityChange}>
            <SelectTrigger className="hidden h-8 min-w-[100px] border-0 bg-muted/50 sm:flex">
              <SelectValue>{getCityDropdownLabel(city)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {getCityDropdownLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-1.5 sm:flex"
            disabled
            title="Filters coming soon"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </Button>
        </div>
      </div>
    </header>
  );
}
