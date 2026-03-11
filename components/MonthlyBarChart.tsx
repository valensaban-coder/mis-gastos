"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, MONTHS, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/utils";

const CATEGORIES = [
  "comida",
  "transporte",
  "entretenimiento",
  "suscripciones",
  "combustible",
  "salud",
  "otros",
] as const;

interface MonthlyBarChartProps {
  year: number;
  refreshKey?: number;
}

type MonthRow = {
  month: number;
  name?: string;
  comida: number;
  transporte: number;
  entretenimiento: number;
  suscripciones: number;
  combustible: number;
  salud: number;
  otros: number;
};

export function MonthlyBarChart({ year, refreshKey }: MonthlyBarChartProps) {
  const [data, setData] = useState<MonthRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/expenses/monthly?year=${year}`)
      .then((r) => r.json())
      .then((rows: MonthRow[]) => {
        const filled = rows.map((r) => ({
          ...r,
          name: MONTHS[r.month - 1].slice(0, 3),
        }));
        setData(filled);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, refreshKey]);

  // Only render bars for categories that have at least one non-zero value
  const activeCategories = CATEGORIES.filter((cat) =>
    data.some((row) => (row[cat] ?? 0) > 0),
  );

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Evolución mensual {year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Cargando...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barSize={18} barCategoryGap="30%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
                width={38}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  CATEGORY_LABELS[name] ?? name,
                ]}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                    {CATEGORY_LABELS[value] ?? value}
                  </span>
                )}
              />
              {activeCategories.map((cat) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  stackId="a"
                  fill={CATEGORY_COLORS[cat]}
                  radius={
                    cat === activeCategories[activeCategories.length - 1]
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
