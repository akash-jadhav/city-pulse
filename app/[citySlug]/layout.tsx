import { notFound } from "next/navigation";
import { getCityConfig } from "@/config/cities/delhi";
import { loadCityDataset } from "@/lib/data/load";
import { CityProvider } from "@/providers/CityProvider";
import { AppHeader } from "@/components/chrome/AppHeader";
import { MobileNav } from "@/components/chrome/MobileNav";

export default async function CityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ citySlug: string }>;
}) {
  const { citySlug } = await params;
  const city = getCityConfig(citySlug);
  if (!city) notFound();

  const dataset = await loadCityDataset(citySlug);

  return (
    <CityProvider city={city} dataset={dataset}>
      <AppHeader />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <MobileNav />
    </CityProvider>
  );
}
