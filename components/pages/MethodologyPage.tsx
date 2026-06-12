"use client";

import { motion } from "framer-motion";
import { useDataset } from "@/providers/CityProvider";
import {
  DashboardLayout,
  SectionHeader,
} from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

export function MethodologyPage() {
  const dataset = useDataset();

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          eyebrow="Methodology"
          title="Data & scoring"
          description="How City Pulse processes survey data and computes scores"
        />

        <div className="space-y-6">
          <Card>
            <CardContent className="prose prose-sm max-w-none pt-6 dark:prose-invert">
              <h3>Data source</h3>
              <p>
                Responses are collected via the &ldquo;Rate Your Neighbourhood!&rdquo;
                Google Form. Data is exported as CSV, processed locally, and
                published as read-only JSON — visitors cannot upload or modify data.
              </p>
              <ul>
                <li>Source: {dataset.meta.source}</li>
                <li>Total responses: {dataset.meta.totalResponses}</li>
                <li>Last imported: {new Date(dataset.meta.importedAt).toLocaleString()}</li>
                {dataset.meta.checksum && <li>Checksum: {dataset.meta.checksum}</li>}
              </ul>

              <h3>Scoring</h3>
              <p>
                Ratings with star labels are normalized to 0–100. Overall score =
                25% safety + 30% infrastructure + 25% civic reliability + 20%
                satisfaction.
              </p>

              <h3>Privacy</h3>
              <p>
                Names, phone numbers, and enumerator notes are stripped during
                import. Map points may represent approximate response locations.
              </p>

              <h3>Limitations</h3>
              <p>
                Sample sizes vary by area. Clusters with fewer than 5 responses
                are flagged. Community Voice sentiment uses keyword heuristics,
                not AI.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
