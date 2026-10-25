"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { API_URL, recordPayment } from "@/app/lib/api";
import type { Invoice } from "@/app/types";
import { formatCurrencyMXN } from "@/lib/legal-domain";

interface RecordPaymentModalProps {
    invoice: Invoice;
    isOpen: boolean;
    onClose: () => void;
}

export default function RecordPaymentModal({ invoice, isOpen, onClose }: RecordPaymentModalProps) {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        amount: "",
        method: "Transferencia",
        notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await recordPayment(
                invoice.id,
                {
                    amount: parseFloat(formData.amount),
                    method: formData.method,
                    notes: formData.notes,
                },
                API_URL
            );

            toast.success("Abono registrado exitosamente");
            setFormData({ amount: "", method: "Transferencia", notes: "" });
            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al registrar el abono");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Abono — {invoice.invoice_number}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1 p-3 rounded-md bg-muted/50 border">
                        <Label className="text-xs text-muted-foreground">Saldo Pendiente Actual</Label>
                        <div className="text-lg font-bold">{formatCurrencyMXN(invoice.balance_due)}</div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Monto del Abono (MXN) *</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={invoice.balance_due}
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="method">Forma de Pago</Label>
                        <Select
                            onValueChange={(value) => setFormData({ ...formData, method: value })}
                            value={formData.method}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar forma de pago" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Transferencia">Transferencia SPEI</SelectItem>
                                <SelectItem value="Efectivo">Efectivo</SelectItem>
                                <SelectItem value="Tarjeta">Tarjeta Bancaria</SelectItem>
                                <SelectItem value="Cheque">Cheque Nominativo</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Referencia / Observaciones</Label>
                        <Input
                            id="notes"
                            placeholder="Clave de rastreo SPEI, banco emisor, recibo..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Registrando..." : "Registrar Abono"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
