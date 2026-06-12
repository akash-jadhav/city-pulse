"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useDataset } from "@/providers/CityProvider";
import { getQuotes } from "@/lib/analytics";
import {
  aggregateSentiment,
  extractTopics,
  extractWordFreq,
} from "@/lib/sentiment/analyze";
import {
  DashboardLayout,
  SectionHeader,
} from "@/components/layouts/DashboardLayout";
import {
  AiComingSoonBanner,
  QuoteCarousel,
  SentimentSummaryBar,
  WordCloud,
} from "@/components/insights/Insights";
import { Badge } from "@/components/ui/badge";

export function CommunityPage() {
  const dataset = useDataset();
  const texts = useMemo(
    () =>
      dataset.responses.flatMap((r) =>
        [
          r.loveText,
          r.commentsText,
          r.electricityComment,
          r.roadComment,
          r.safetyComment,
          r.businessComment,
        ].filter(Boolean) as string[]
      ),
    [dataset.responses]
  );
  const sentiment = useMemo(() => aggregateSentiment(texts), [texts]);
  const words = useMemo(() => extractWordFreq(texts), [texts]);
  const topics = useMemo(() => extractTopics(texts), [texts]);
  const quotes = useMemo(() => getQuotes(dataset.responses, 6), [dataset.responses]);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          eyebrow="Community voice"
          title="What residents are saying"
          description="Keyword-based sentiment and themes from open-ended responses"
        />

        <QuoteCarousel quotes={quotes} />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 font-semibold">Sentiment (experimental)</h3>
            <SentimentSummaryBar {...sentiment} />
          </div>
          <div>
            <h3 className="mb-3 font-semibold">Topic clusters</h3>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <Badge key={t.topic} variant="secondary">
                  {t.topic} ({t.count})
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="mb-3 font-semibold">Word frequency</h3>
          <WordCloud words={words} />
        </div>

        <div className="mt-8">
          <AiComingSoonBanner />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
