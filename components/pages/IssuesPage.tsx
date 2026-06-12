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
import { IssueRankList } from "@/components/insights/Insights";
import { DistributionBarChart } from "@/components/charts/Charts";

export function IssuesPage() {
  const dataset = useDataset();
  const civic = useMemo(
    () => rankIssues(dataset.responses, "civicHazards"),
    [dataset.responses]
  );
  const business = useMemo(
    () => rankIssues(dataset.responses, "businessChallenges"),
    [dataset.responses]
  );
  const emergency = useMemo(
    () =>
      distribution(dataset.responses, (r) => LABELS.emergency[r.emergencyResponse]),
    [dataset.responses]
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          eyebrow="Civic issues"
          title="Issues explorer"
          description="Most reported problems ranked by frequency and severity"
        />

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 font-semibold">Civic hazards</h3>
            <IssueRankList issues={civic} />
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Business infrastructure challenges</h3>
            <IssueRankList issues={business} />
          </div>
        </div>

        <div className="mt-8">
          <DistributionBarChart
            data={emergency}
            title="Emergency response confidence"
          />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
