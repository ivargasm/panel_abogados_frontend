"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/app/store/Store";
import { toast } from "sonner";
import { recordPayment } from "@/app/lib/api";
import type { Invoice } from "@/app/types";

interface RecordPaymentModalProps {
    invoice: Invoice;
    isOpen: boolean;
    onClose: () => void;
}

export default function RecordPaymentModal({ invoice, isOpen, onClose }: RecordPaymentModalProps) {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        amount: "",
        method: "Efectivo",
        notes: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await recordPayment(invoice.id, {
                amount: parseFloat(formData.amount),
                method: formData.method,
                notes: formData.notes
            }, process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

            toast.success("Pago registrado exitosamente");
            onClose();
            setFormData({ amount: "", method: "Efectivo", notes: "" });
        } catch (error) {
            console.error(error);
            toast.error("Error al registrar el pago");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Pago - {invoice.invoice_number}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Saldo Pendiente</Label>
                        <div className="text-lg font-bold">${invoice.balance_due.toFixed(2)}</div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Monto a Pagar</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            max={invoice.balance_due}
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="method">Método de Pago</Label>
                        <Select
                            onValueChange={(value) => setFormData({ ...formData, method: value })}
                            value={formData.method}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar método" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Efectivo">Efectivo</SelectItem>
                                <SelectItem value="Transferencia">Transferencia</SelectItem>
                                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas</Label>
                        <Input
                            id="notes"
                            placeholder="Referencia, banco, etc."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Registrando..." : "Registrar Pago"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
