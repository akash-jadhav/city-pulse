"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RankedIssue } from "@/types/analytics";

export function StrengthsConcernsPanel({
  strengths,
  concerns,
}: {
  strengths: { label: string; score: number }[];
  concerns: RankedIssue[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <p className="mb-3 text-sm font-medium text-emerald-600">Top strengths</p>
          <ul className="space-y-2">
            {strengths.map((s) => (
              <li key={s.label} className="flex justify-between text-sm">
                <span>{s.label}</span>
                <Badge variant="secondary">{s.score}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="mb-3 text-sm font-medium text-amber-600">Top concerns</p>
          <ul className="space-y-2">
            {concerns.map((c) => (
              <li key={c.id} className="flex justify-between text-sm">
                <span>{c.label}</span>
                <Badge variant="outline">{c.percent}%</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export function QuoteCarousel({ quotes }: { quotes: string[] }) {
  if (quotes.length === 0) return null;
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {quotes.map((q, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="h-full">
            <CardContent className="pt-6 text-sm italic text-muted-foreground">
              &ldquo;{q}&rdquo;
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export function WordCloud({
  words,
}: {
  words: { word: string; count: number }[];
}) {
  const max = words[0]?.count ?? 1;
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border p-6">
      {words.map((w) => (
        <span
          key={w.word}
          className="text-foreground"
          style={{ fontSize: `${12 + (w.count / max) * 20}px` }}
        >
          {w.word}
        </span>
      ))}
    </div>
  );
}

export function SentimentSummaryBar({
  positive,
  neutral,
  negative,
}: {
  positive: number;
  neutral: number;
  negative: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex h-3 overflow-hidden rounded-full">
        <div className="bg-emerald-500" style={{ width: `${positive}%` }} />
        <div className="bg-gray-300" style={{ width: `${neutral}%` }} />
        <div className="bg-red-500" style={{ width: `${negative}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Positive {positive}%</span>
        <span>Neutral {neutral}%</span>
        <span>Negative {negative}%</span>
      </div>
    </div>
  );
}

export function AiComingSoonBanner() {
  return (
    <div className="rounded-xl border border-dashed bg-muted/30 p-6 backdrop-blur-sm">
      <p className="font-medium">AI-powered analysis — coming soon</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Topic clustering, automated reports, and deeper sentiment analysis will
        arrive when we add a backend. Current insights use keyword heuristics.
      </p>
    </div>
  );
}

export function IssueRankList({ issues }: { issues: RankedIssue[] }) {
  return (
    <ol className="space-y-3">
      {issues.map((issue, i) => (
        <li key={issue.id} className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{issue.label}</span>
              <span className="text-muted-foreground">{issue.count}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-red-500"
                style={{ width: `${issue.percent}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
