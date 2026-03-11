import { TrendingDown, Hash, Tag } from "lucide-react";
import { formatCurrency, CATEGORY_LABELS } from "@/lib/utils";

interface SummaryCardsProps {
  total: number;
  count: number;
  topCategory: string;
}

export function SummaryCards({ total, count, topCategory }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Total */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <TrendingDown className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11px] text-emerald-300/70 truncate">Total</span>
        </div>
        <p className="text-base sm:text-xl font-bold text-emerald-400 leading-none truncate">
          {formatCurrency(total)}
        </p>
      </div>

      {/* Count */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <span className="text-[11px] text-blue-300/70 truncate">Gastos</span>
        </div>
        <p className="text-base sm:text-xl font-bold text-blue-400 leading-none">
          {count}
        </p>
      </div>

      {/* Top category */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] text-amber-300/70 truncate">Top cat.</span>
        </div>
        <p className="text-base sm:text-xl font-bold text-amber-400 leading-none truncate">
          {CATEGORY_LABELS[topCategory] ?? "—"}
        </p>
      </div>
    </div>
  );
}
