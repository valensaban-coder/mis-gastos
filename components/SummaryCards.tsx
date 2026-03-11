import { TrendingDown, Hash, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, CATEGORY_LABELS } from "@/lib/utils";

interface SummaryCardsProps {
  total: number;
  count: number;
  topCategory: string;
}

export function SummaryCards({ total, count, topCategory }: SummaryCardsProps) {
  const cards = [
    {
      label: "Total del mes",
      value: formatCurrency(total),
      icon: TrendingDown,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Gastos registrados",
      value: count.toString(),
      icon: Hash,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Categoría top",
      value: CATEGORY_LABELS[topCategory] ?? "—",
      icon: Tag,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label} className="border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`rounded-lg p-3 ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
