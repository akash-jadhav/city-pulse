"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useDataset } from "@/providers/CityProvider";
import { computeScores, distribution, clusterByCoordinates } from "@/lib/analytics";
import { LABELS, SAFETY_SCORES } from "@/lib/import/normalize";
import {
  DashboardLayout,
  SectionHeader,
} from "@/components/layouts/DashboardLayout";
import { DonutChart } from "@/components/charts/Charts";
import { KpiCard } from "@/components/kpi/KpiCard";
import { ResponseMap } from "@/components/geo/ResponseMap";
import { Card, CardContent } from "@/components/ui/card";

export function SafetyPage() {
  const dataset = useDataset();
  const safetyDist = useMemo(
    () =>
      distribution(dataset.responses, (r) => LABELS.safety[r.safetyRating]),
    [dataset.responses]
  );
  const scores = useMemo(() => computeScores(dataset.responses), [dataset.responses]);
  const clusters = useMemo(
    () =>
      [...clusterByCoordinates(dataset.responses)].sort(
        (a, b) => b.scores.safety - a.scores.safety
      ),
    [dataset.responses]
  );

  const confidence = Math.round(
    dataset.responses.reduce((s, r) => s + SAFETY_SCORES[r.safetyRating], 0) /
      dataset.responses.length
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          eyebrow="Safety"
          title="Safety insights"
          description="How residents feel walking alone after dark"
        />

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <KpiCard label="Safety score" value={scores.safety} suffix="/100" />
          <KpiCard label="Confidence index" value={confidence} suffix="/100" />
          <KpiCard label="Responses" value={dataset.responses.length} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DonutChart data={safetyDist} title="Safety after dark distribution" />
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="mb-2 text-sm font-medium text-emerald-600">Safest areas</p>
                <ul className="space-y-2 text-sm">
                  {clusters.slice(0, 3).map((c) => (
                    <li key={c.id} className="flex justify-between">
                      <span>{c.label}</span>
                      <span className="font-medium">{c.scores.safety}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-2 text-sm font-medium text-red-600">Areas of concern</p>
                <ul className="space-y-2 text-sm">
                  {clusters.slice(-3).reverse().map((c) => (
                    <li key={c.id} className="flex justify-between">
                      <span>{c.label}</span>
                      <span className="font-medium">{c.scores.safety}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <SectionHeader title="Safety map overlay" />
          <ResponseMap responses={dataset.responses} clusters={clusters} height="320px" />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
