"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { SummaryCards } from "@/components/SummaryCards";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { MonthlyBarChart } from "@/components/MonthlyBarChart";
import { ExpenseList, type Expense } from "@/components/ExpenseList";
import { AddExpenseForm, type ManualExpense } from "@/components/AddExpenseForm";
import { MonthSelector } from "@/components/MonthSelector";

export default function Dashboard() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("fetch failed");
      const data: Expense[] = await res.json();
      setExpenses(data);
      setRefreshKey((k) => k + 1);
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
          <div className="flex items-center gap-2">
            <MonthSelector month={month} year={year} onChange={handleMonthChange} />
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-border hover:border-emerald-500 text-muted-foreground hover:text-foreground transition-colors"
                title="Cambiar tema"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title={session?.user?.email ?? "Cerrar sesión"}
              className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-border hover:border-emerald-500 transition-colors"
            >
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {session?.user?.email?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-5 space-y-4 sm:space-y-5 pb-16">
        <SummaryCards
          total={total}
          count={expenses.length}
          topCategory={topCategory}
        />

        <AddExpenseForm onAdd={handleAdd} onAddManual={handleAddManual} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CategoryPieChart data={categoryTotals} />
          <MonthlyBarChart year={year} refreshKey={refreshKey} />
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
