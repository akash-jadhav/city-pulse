"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GeoCluster } from "@/types/analytics";

export function ClusterList({
  clusters,
  selectedId,
  onSelect,
}: {
  clusters: GeoCluster[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const sorted = [...clusters].sort(
    (a, b) => b.responseCount - a.responseCount
  );

  return (
    <div className="space-y-2 overflow-y-auto">
      {sorted.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className={`w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/50 ${
            selectedId === c.id ? "border-foreground bg-muted/50" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-medium">{c.label}</p>
            <Badge variant="secondary">{c.responseCount}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Overall {c.scores.overall} · Safety {c.scores.safety}
          </p>
        </button>
      ))}
    </div>
  );
}

export function GeoScorecard({ cluster }: { cluster: GeoCluster }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {cluster.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Overall</p>
          <p className="text-2xl font-bold">{cluster.scores.overall}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Safety</p>
          <p className="text-2xl font-bold">{cluster.scores.safety}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Infrastructure</p>
          <p className="text-xl font-semibold">{cluster.scores.infrastructure}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Responses</p>
          <p className="text-xl font-semibold">{cluster.responseCount}</p>
        </div>
      </CardContent>
    </Card>
  );
}
