"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AddItemModalProps {
    invoiceId: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function AddItemModal({ invoiceId, isOpen, onClose }: AddItemModalProps) {
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [price, setPrice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subtotal = (parseFloat(quantity) || 0) * (parseFloat(price) || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/invoices/${invoiceId}/items/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    description,
                    quantity: parseInt(quantity),
                    price: parseFloat(price),
                }),
            });

            if (response.ok) {
                toast.success("Concepto agregado correctamente");
                setDescription("");
                setQuantity("1");
                setPrice("");
                onClose();
            } else {
                const error = await response.json();
                toast.error(error.detail || "Error al agregar concepto");
            }
        } catch (error) {
            console.error("Error adding item:", error);
            toast.error("Error de conexión");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar Concepto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ej: Consulta inicial, Redacción de contrato..."
                            rows={2}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="quantity">Cantidad</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                step="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="price">Precio Unitario</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-muted p-3 rounded-md">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Subtotal:</span>
                            <span className="text-lg font-bold">${subtotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Agregando..." : "Agregar Concepto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
