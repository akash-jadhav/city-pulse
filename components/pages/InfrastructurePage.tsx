"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useDataset } from "@/providers/CityProvider";
import { distribution, rankIssues } from "@/lib/analytics";
import { LABELS } from "@/lib/import/normalize";
import {
  DashboardLayout,
  SectionHeader,
} from "@/components/layouts/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DistributionBarChart,
  RankedHorizontalBar,
} from "@/components/charts/Charts";
import { KpiCard } from "@/components/kpi/KpiCard";
import { QUALITY_SCORES } from "@/lib/import/normalize";

export function InfrastructurePage() {
  const dataset = useDataset();
  const electricity = useMemo(
    () =>
      distribution(dataset.responses, (r) =>
        LABELS.quality[r.electricityRating].replace("Unknown", "Unknown")
      ),
    [dataset.responses]
  );
  const roads = useMemo(
    () =>
      distribution(dataset.responses, (r) => LABELS.quality[r.roadRating]),
    [dataset.responses]
  );
  const hazards = useMemo(
    () => rankIssues(dataset.responses, "civicHazards"),
    [dataset.responses]
  );

  const elecAvg = Math.round(
    dataset.responses.reduce(
      (s, r) => s + QUALITY_SCORES[r.electricityRating],
      0
    ) / dataset.responses.length
  );
  const roadAvg = Math.round(
    dataset.responses.reduce((s, r) => s + QUALITY_SCORES[r.roadRating], 0) /
      dataset.responses.length
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          eyebrow="Infrastructure"
          title="Infrastructure insights"
          description="Electricity, roads, and civic hazards reported by residents"
        />

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard label="Electricity avg" value={elecAvg} suffix="/100" />
          <KpiCard label="Roads avg" value={roadAvg} suffix="/100" />
          <KpiCard label="Hazard reports" value={hazards.reduce((s, h) => s + h.count, 0)} />
          <KpiCard label="Top hazard" value={hazards[0]?.label.slice(0, 12) ?? "—"} />
        </div>

        <Tabs defaultValue="electricity">
          <TabsList>
            <TabsTrigger value="electricity">Electricity</TabsTrigger>
            <TabsTrigger value="roads">Roads</TabsTrigger>
            <TabsTrigger value="hazards">Civic hazards</TabsTrigger>
          </TabsList>
          <TabsContent value="electricity" className="mt-4">
            <DistributionBarChart data={electricity} title="Electricity rating distribution" />
          </TabsContent>
          <TabsContent value="roads" className="mt-4">
            <DistributionBarChart data={roads} title="Road quality distribution" />
          </TabsContent>
          <TabsContent value="hazards" className="mt-4">
            <RankedHorizontalBar
              data={hazards.map((h) => ({
                label: h.label,
                count: h.count,
                percent: h.percent,
              }))}
              title="Most reported civic hazards"
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
