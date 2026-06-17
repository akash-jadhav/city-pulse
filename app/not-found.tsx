import Link from "next/link";
import { BRAND } from "@/config/brand";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {BRAND.name}
      </p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-center text-muted-foreground">
        This city or page does not exist yet.
      </p>
      <Link
        href="/india"
        className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
