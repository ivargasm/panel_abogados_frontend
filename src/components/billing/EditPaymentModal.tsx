"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { API_URL } from "@/app/lib/api";

interface Payment {
    id: number;
    amount: number;
    payment_date: string;
    method: string;
    notes?: string | null;
}

interface EditPaymentModalProps {
    payment: Payment | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditPaymentModal({ payment, isOpen, onClose }: EditPaymentModalProps) {
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("Transferencia");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (payment) {
            setAmount(payment.amount.toString());
            setMethod(payment.method || "Transferencia");
            setNotes(payment.notes || "");
        }
    }, [payment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payment) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/billing/payments/${payment.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    method,
                    notes,
                }),
            });

            if (response.ok) {
                toast.success("Abono actualizado correctamente");
                onClose();
            } else {
                const error = await response.json();
                toast.error(error.detail || "Error al actualizar el abono");
            }
        } catch (error) {
            console.error("Error updating payment:", error);
            toast.error("Error de conexión");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Abono</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="amount">Monto (MXN)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="method">Forma de Pago</Label>
                        <Select value={method} onValueChange={setMethod} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona forma de pago" />
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

                    <div>
                        <Label htmlFor="notes">Referencia / Notas</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
