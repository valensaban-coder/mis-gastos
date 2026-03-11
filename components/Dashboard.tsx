"use client";

import { useState, useEffect, useCallback } from "react";
import { SummaryCards } from "@/components/SummaryCards";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { MonthlyBarChart } from "@/components/MonthlyBarChart";
import { ExpenseList, type Expense } from "@/components/ExpenseList";
import { AddExpenseForm, type ManualExpense } from "@/components/AddExpenseForm";
import { MonthSelector } from "@/components/MonthSelector";

export default function Dashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("fetch failed");
      const data: Expense[] = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  async function handleAddManual(data: ManualExpense): Promise<boolean> {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, source: "web" }),
    });
    if (res.ok) fetchExpenses();
    return res.ok;
  }

  async function handleAdd(text: string): Promise<boolean> {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source: "web" }),
    });
    if (res.ok) fetchExpenses();
    return res.ok;
  }

  async function handleDelete(id: number) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    fetchExpenses();
  }

  async function handleUpdateCategory(id: number, category: string) {
    await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
    fetchExpenses();
  }

  // Derived stats
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
    return acc;
  }, {});

  const topCategory =
    Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] ??
    "—";

  function handleMonthChange(m: number, y: number) {
    setMonth(m);
    setYear(y);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-emerald-400 leading-none">
              MisGastos
            </h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block mt-0.5">
              Finanzas personales
            </p>
          </div>
          <MonthSelector month={month} year={year} onChange={handleMonthChange} />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5 pb-12">
        <SummaryCards
          total={total}
          count={expenses.length}
          topCategory={topCategory}
        />

        <AddExpenseForm onAdd={handleAdd} onAddManual={handleAddManual} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CategoryPieChart data={categoryTotals} />
          <MonthlyBarChart year={year} />
        </div>

        <ExpenseList
          expenses={expenses}
          loading={loading}
          onDelete={handleDelete}
          onUpdateCategory={handleUpdateCategory}
        />
      </main>
    </div>
  );
}
