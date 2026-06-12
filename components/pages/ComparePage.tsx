"use client";

import { motion } from "framer-motion";
import {
  DashboardLayout,
  SectionHeader,
} from "@/components/layouts/DashboardLayout";
import { CompareSelector } from "@/components/compare/CompareSelector";

export function ComparePage() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          eyebrow="Compare"
          title="Comparative analysis"
          description="Compare a neighborhood cluster against city-wide averages"
        />
        <CompareSelector />
      </motion.div>
    </DashboardLayout>
  );
}
