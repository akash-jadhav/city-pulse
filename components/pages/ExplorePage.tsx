"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDataset } from "@/providers/CityProvider";
import { clusterByCoordinates, filterValidMapResponses } from "@/lib/analytics";
import {
  DashboardLayout,
  SectionHeader,
} from "@/components/layouts/DashboardLayout";
import { ResponseMap } from "@/components/geo/ResponseMap";
import { ClusterList, GeoScorecard } from "@/components/geo/ClusterList";
import { Badge } from "@/components/ui/badge";

export function ExplorePage() {
  const dataset = useDataset();
  const clusters = useMemo(
    () => clusterByCoordinates(dataset.responses),
    [dataset.responses]
  );
  const invalidCount =
    dataset.responses.length - filterValidMapResponses(dataset.responses).length;
  const [selectedId, setSelectedId] = useState(clusters[0]?.id);
  const selected = clusters.find((c) => c.id === selectedId);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          eyebrow="Explore"
          title="Neighborhood explorer"
          description="Drill into coordinate clusters. Tap a pin or list item for details."
          action={
            invalidCount > 0 ? (
              <Badge variant="outline">
                {invalidCount} responses without valid Delhi location
              </Badge>
            ) : undefined
          }
        />

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <ClusterList
              clusters={clusters}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <div className="space-y-4 lg:col-span-3">
            <ResponseMap
              responses={dataset.responses}
              clusters={clusters}
              selectedId={selectedId}
              onSelect={setSelectedId}
              height="360px"
            />
            {selected && <GeoScorecard cluster={selected} />}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
