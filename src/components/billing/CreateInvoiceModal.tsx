"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Client {
    id: number;
    full_name: string;
}

interface Case {
    id: number;
    title: string;
}

export default function CreateInvoiceModal({ isOpen, onClose }: CreateInvoiceModalProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [cases, setCases] = useState<Case[]>([]);
    const [clientId, setClientId] = useState("");
    const [caseId, setCaseId] = useState<string>("no-case");
    const [description, setDescription] = useState("");
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState("");
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchClients();
            setIssueDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    const fetchClients = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setClients(data);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const fetchCases = async (clientId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cases?client_id=${clientId}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setCases(data);
            } else {
                setCases([]);
            }
        } catch (error) {
            console.error("Error fetching cases:", error);
            setCases([]);
        }
    };

    const handleClientChange = (value: string) => {
        setClientId(value);
        setCaseId("no-case"); // Reset case selection
        if (value) {
            fetchCases(value);
        } else {
            setCases([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clientId) {
            toast.error("Selecciona un cliente");
            return;
        }

        const total = parseFloat(amount);
        if (total <= 0) {
            toast.error("El total debe ser mayor a 0");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/invoices`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    client_id: parseInt(clientId),
                    case_id: caseId && caseId !== "no-case" ? parseInt(caseId) : null,
                    amount: total,
                    due_date: dueDate || null,
                    description,
                    items: null
                }),
            });

            if (response.ok) {
                toast.success("Factura creada correctamente. Ahora puedes agregar conceptos desde el detalle.");
                resetForm();
                onClose();
            } else {
                const error = await response.json();
                toast.error(error.detail || "Error al crear factura");
            }
        } catch (error) {
            console.error("Error creating invoice:", error);
            toast.error("Error de conexión");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setClientId("");
        setCaseId("no-case");
        setCases([]);
        setDescription("");
        setIssueDate(new Date().toISOString().split('T')[0]);
        setDueDate("");
        setAmount("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Nueva Factura</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="client">Cliente *</Label>
                        <Select value={clientId} onValueChange={handleClientChange} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.id.toString()}>
                                        {client.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="case">Caso (Opcional)</Label>
                        <Select value={caseId} onValueChange={setCaseId} disabled={!clientId}>
                            <SelectTrigger>
                                <SelectValue placeholder={!clientId ? "Selecciona un cliente primero" : "Selecciona un caso (opcional)"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="no-case">Sin caso asociado</SelectItem>
                                {cases.map(c => (
                                    <SelectItem key={c.id} value={c.id.toString()}>
                                        {c.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="issueDate">Fecha de Emisión *</Label>
                            <Input
                                id="issueDate"
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="amount">Total *</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción de la factura..."
                            rows={3}
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm text-blue-800">
                        💡 Después de crear la factura, podrás agregar conceptos detallados desde la vista de detalle.
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creando..." : "Crear Factura"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

