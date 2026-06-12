import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">This city or page does not exist yet.</p>
      <Link
        href="/delhi"
        className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Go to Delhi dashboard
      </Link>
    </div>
  );
}
