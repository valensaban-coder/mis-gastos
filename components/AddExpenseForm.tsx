"use client";

import { useState, type FormEvent } from "react";
import { Plus, Loader2, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/utils";

const CATEGORIES = [
  "comida",
  "transporte",
  "entretenimiento",
  "suscripciones",
  "combustible",
  "salud",
  "ropa",
  "regalos",
  "hogar",
  "viajes",
  "otros",
] as const;

interface AddExpenseFormProps {
  onAdd: (text: string) => Promise<boolean>;
  onAddManual: (data: ManualExpense) => Promise<boolean>;
}

export interface ManualExpense {
  description: string;
  amount: number;
  category: string;
  date: string;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function AddExpenseForm({ onAdd, onAddManual }: AddExpenseFormProps) {
  const [text, setText] = useState("");
  const [loadingQuick, setLoadingQuick] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [open, setOpen] = useState(false);
  const [loadingManual, setLoadingManual] = useState(false);
  const [form, setForm] = useState<ManualExpense>({
    description: "",
    amount: 0,
    category: "otros",
    date: todayISO(),
  });

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleQuickSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || loadingQuick) return;
    setLoadingQuick(true);
    const ok = await onAdd(text.trim());
    if (ok) {
      showFeedback("success", "✅ Gasto agregado");
      setText("");
    } else {
      showFeedback("error", '❌ No detecté monto. Ej: "almuerzo 1500"');
    }
    setLoadingQuick(false);
  }

  async function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.description.trim() || form.amount <= 0 || loadingManual) return;
    setLoadingManual(true);
    const ok = await onAddManual(form);
    if (ok) {
      setOpen(false);
      setForm({ description: "", amount: 0, category: "otros", date: todayISO() });
      showFeedback("success", "✅ Gasto agregado");
    } else {
      showFeedback("error", "❌ Error al guardar");
    }
    setLoadingManual(false);
  }

  return (
    <>
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(true)}
              className="shrink-0 px-3"
              title="Formulario completo"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <form onSubmit={handleQuickSubmit} className="flex gap-2 flex-1">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='"almuerzo 1500" o "uber 2800"'
                className="flex-1 bg-background/60"
                disabled={loadingQuick}
                autoComplete="off"
                autoCorrect="off"
              />
              <Button type="submit" disabled={loadingQuick || !text.trim()} className="shrink-0">
                {loadingQuick ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
          {feedback && (
            <p
              className={`mt-2 text-xs ${
                feedback.type === "success" ? "text-emerald-500" : "text-red-400"
              }`}
            >
              {feedback.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm w-[calc(100vw-2rem)] mx-auto">
          <DialogHeader>
            <DialogTitle>Agregar gasto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="desc">Descripción</Label>
              <Input
                id="desc"
                placeholder="Ej: Almuerzo con Lucas"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Monto ($)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="1500"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="z-50 max-h-64 overflow-y-auto"
                  position="popper"
                  sideOffset={4}
                >
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full shrink-0"
                          style={{ background: CATEGORY_COLORS[cat] }}
                        />
                        {CATEGORY_LABELS[cat]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  loadingManual ||
                  !form.description.trim() ||
                  form.amount <= 0
                }
              >
                {loadingManual ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
