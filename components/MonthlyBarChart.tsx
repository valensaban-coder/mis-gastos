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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, MONTHS } from "@/lib/utils";

interface MonthlyRow {
  month: number;
  year: number;
  total: number;
  count: number;
}

interface MonthlyBarChartProps {
  year: number;
  refreshKey?: number;
}

export function MonthlyBarChart({ year, refreshKey }: MonthlyBarChartProps) {
  const [data, setData] = useState<MonthlyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/expenses/monthly?year=${year}`)
      .then((r) => r.json())
      .then((rows: MonthlyRow[]) => {
        // Fill all 12 months, even those with 0 spend
        const filled = Array.from({ length: 12 }, (_, i) => {
          const found = rows.find((r) => r.month === i + 1);
          return {
            month: i + 1,
            year,
            total: found ? Number(found.total) : 0,
            count: found?.count ?? 0,
            name: MONTHS[i].slice(0, 3),
          };
        });
        setData(filled);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, refreshKey]);

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
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} barSize={20}>
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
                formatter={(value: number) => [formatCurrency(value), "Total"]}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
