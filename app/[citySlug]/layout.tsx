import { notFound } from "next/navigation";
import { getAllCityConfigs, getCityConfig } from "@/config/cities/index";
import { loadCityDataset } from "@/lib/data/load";
import { CityProvider } from "@/providers/CityProvider";
import { GoogleMapsProvider } from "@/providers/GoogleMapsProvider";
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
  const city = await getCityConfig(citySlug);
  if (!city) notFound();

  const [dataset, availableCities] = await Promise.all([
    loadCityDataset(citySlug),
    getAllCityConfigs(),
  ]);

  return (
    <GoogleMapsProvider>
      <CityProvider city={city} dataset={dataset} availableCities={availableCities}>
        <AppHeader />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <MobileNav />
      </CityProvider>
    </GoogleMapsProvider>
  );
}
