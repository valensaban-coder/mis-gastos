"use client";

import { useState } from "react";
import { Trash2, MessageCircle, Globe, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/utils";

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  source: "whatsapp" | "web";
  created_at: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onUpdateCategory: (id: number, category: string) => Promise<void>;
}

const CATEGORIES = [
  "comida",
  "transporte",
  "entretenimiento",
  "suscripciones",
  "combustible",
  "salud",
  "otros",
] as const;

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export function ExpenseList({
  expenses,
  loading,
  onDelete,
  onUpdateCategory,
}: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function handleDelete() {
    if (confirmId === null) return;
    setDeletingId(confirmId);
    await onDelete(confirmId);
    setDeletingId(null);
    setConfirmId(null);
  }

  async function handleCategoryChange(id: number, category: string) {
    setUpdatingId(id);
    await onUpdateCategory(id, category);
    setUpdatingId(null);
  }

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-3 px-4">
          <CardTitle className="text-base font-medium flex items-center justify-between">
            <span>Gastos del mes</span>
            <span className="text-xs font-normal text-muted-foreground">
              {expenses.length} registros
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Cargando gastos...</span>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <p className="text-sm">Sin gastos este mes</p>
              <p className="text-xs opacity-60">
                Agregá uno con el formulario de arriba
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="px-4 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Row 1: source icon + description + amount */}
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 mt-0.5">
                      {expense.source === "whatsapp" ? (
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Globe className="h-3.5 w-3.5 text-blue-400" />
                      )}
                    </span>
                    <span className="flex-1 text-sm font-medium truncate">
                      {expense.description}
                    </span>
                    <span className="text-sm font-bold text-emerald-400 shrink-0">
                      {formatCurrency(Number(expense.amount))}
                    </span>
                  </div>

                  {/* Row 2: date + category + delete */}
                  <div className="flex items-center gap-2 mt-1.5 pl-5">
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(expense.date)}
                    </span>

                    <div className="flex-1">
                      {updatingId === expense.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      ) : (
                        <Select
                          value={expense.category}
                          onValueChange={(v) =>
                            handleCategoryChange(expense.id, v)
                          }
                        >
                          <SelectTrigger className="h-6 w-auto gap-1 border-0 bg-transparent p-0 focus:ring-0 focus:ring-offset-0">
                            <SelectValue>
                              <Badge
                                variant="outline"
                                style={{
                                  color: CATEGORY_COLORS[expense.category],
                                  borderColor:
                                    CATEGORY_COLORS[expense.category] + "50",
                                }}
                                className="text-[11px] font-normal px-1.5 py-0"
                              >
                                {CATEGORY_LABELS[expense.category] ??
                                  expense.category}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {CATEGORY_LABELS[cat]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                      onClick={() => setConfirmId(expense.id)}
                      disabled={deletingId === expense.id}
                    >
                      {deletingId === expense.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmId !== null} onOpenChange={() => setConfirmId(null)}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Eliminar gasto</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
