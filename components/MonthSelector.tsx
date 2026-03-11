"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MONTHS } from "@/lib/utils";

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  function prev() {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  }

  function next() {
    const now = new Date();
    const isCurrentOrFuture =
      year > now.getFullYear() ||
      (year === now.getFullYear() && month >= now.getMonth() + 1);
    if (isCurrentOrFuture) return;
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  }

  const isCurrentMonth =
    month === new Date().getMonth() + 1 &&
    year === new Date().getFullYear();

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[140px] text-center text-sm font-medium text-gray-200">
        {MONTHS[month - 1]} {year}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={next}
        disabled={isCurrentMonth}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
