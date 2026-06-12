"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { useDataset, useCity } from "@/providers/CityProvider";
import {
  computeScores,
  getStrengthsAndConcerns,
  clusterByCoordinates,
} from "@/lib/analytics";
import {
  DashboardLayout,
  SectionHeader,
} from "@/components/layouts/DashboardLayout";
import { KpiCard, KpiGrid } from "@/components/kpi/KpiCard";
import { CityHealthGauge } from "@/components/charts/Charts";
import { StrengthsConcernsPanel } from "@/components/insights/Insights";

export function ExecutiveOverviewPage() {
  const dataset = useDataset();
  const city = useCity();
  const scores = useMemo(
    () => computeScores(dataset.responses, city.localityCount),
    [dataset.responses, city.localityCount]
  );
  const { strengths, concerns } = useMemo(
    () => getStrengthsAndConcerns(dataset.responses),
    [dataset.responses]
  );
  const clusters = useMemo(
    () =>
      [...clusterByCoordinates(dataset.responses)].sort(
        (a, b) => b.scores.overall - a.scores.overall
      ),
    [dataset.responses]
  );

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <SectionHeader
          eyebrow={city.name}
          title={`How ${city.name} feels today`}
          description={`${scores.responseCount} responses · ${scores.coveragePercent}% area coverage`}
        />

        <KpiGrid>
          <KpiCard
            label="Overall"
            value={scores.overall}
            suffix="/100"
            tooltip="Weighted composite of safety, infrastructure, civic reliability, and satisfaction"
          />
          <KpiCard label="Safety" value={scores.safety} suffix="/100" />
          <KpiCard label="Infrastructure" value={scores.infrastructure} suffix="/100" />
          <KpiCard label="Civic reliability" value={scores.civicReliability} suffix="/100" />
          <KpiCard label="Satisfaction" value={scores.satisfaction} suffix="/100" />
          <KpiCard label="Responses" value={scores.responseCount} />
        </KpiGrid>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <CityHealthGauge score={scores.overall} />
          <StrengthsConcernsPanel strengths={strengths} concerns={concerns} />
        </div>

        <div className="mt-8">
          <SectionHeader
            title="Best vs lowest scoring areas"
            description="Based on coordinate clusters with 3+ responses"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {clusters.slice(0, 1).map((c) => (
              <div key={c.id} className="rounded-xl border p-4">
                <p className="text-sm text-emerald-600">Highest</p>
                <p className="font-semibold">{c.label}</p>
                <p className="text-2xl font-bold">{c.scores.overall}</p>
              </div>
            ))}
            {clusters.slice(-1).map((c) => (
              <div key={c.id} className="rounded-xl border p-4">
                <p className="text-sm text-red-600">Lowest</p>
                <p className="font-semibold">{c.label}</p>
                <p className="text-2xl font-bold">{c.scores.overall}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href={`/${city.slug}/explore`}
            className="inline-flex h-8 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Explore neighborhoods
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
