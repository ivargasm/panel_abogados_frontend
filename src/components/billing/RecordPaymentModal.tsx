"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileCheck, Loader2, Sparkles, X } from "lucide-react";
import { API_URL, recordPayment, uploadAndParseReceipt } from "@/app/lib/api";
import type { Invoice } from "@/app/types";
import { formatCurrencyMXN } from "@/lib/legal-domain";

interface RecordPaymentModalProps {
    invoice: Invoice;
    isOpen: boolean;
    onClose: () => void;
}

export default function RecordPaymentModal({ invoice, isOpen, onClose }: RecordPaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [extractedBanner, setExtractedBanner] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        amount: "",
        method: "Transferencia",
        payment_date: new Date().toISOString().split("T")[0],
        tracking_key: "",
        issuing_bank: "",
        notes: "",
        receipt_file_path: "",
        receipt_file_name: "",
    });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setExtracting(true);
        setExtractedBanner(null);

        try {
            const result = await uploadAndParseReceipt(file, API_URL);
            const { extracted_data, receipt_file_path, receipt_file_name } = result;

            setFormData((prev) => ({
                ...prev,
                amount: extracted_data.amount ? String(extracted_data.amount) : prev.amount,
                payment_date: extracted_data.payment_date || prev.payment_date,
                tracking_key: extracted_data.tracking_key || prev.tracking_key,
                issuing_bank: extracted_data.issuing_bank || prev.issuing_bank,
                method: extracted_data.method === "cash" ? "Efectivo" : "Transferencia",
                notes: extracted_data.suggested_notes || prev.notes,
                receipt_file_path,
                receipt_file_name,
            }));

            const details = [];
            if (extracted_data.amount) details.push(`Monto: ${formatCurrencyMXN(extracted_data.amount)}`);
            if (extracted_data.tracking_key) details.push(`Rastreo: ${extracted_data.tracking_key}`);
            if (extracted_data.issuing_bank) details.push(`Banco: ${extracted_data.issuing_bank}`);

            setExtractedBanner(
                `Datos extraídos exitosamente del comprobante (${details.join(" • ")}). Puedes verificar y editar cualquier dato antes de guardar.`
            );
            toast.success("Comprobante analizado con éxito");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al procesar el archivo");
        } finally {
            setExtracting(false);
        }
    };

    const handleClearReceipt = () => {
        setFormData((prev) => ({
            ...prev,
            receipt_file_path: "",
            receipt_file_name: "",
        }));
        setExtractedBanner(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await recordPayment(
                invoice.id,
                {
                    amount: parseFloat(formData.amount),
                    method: formData.method,
                    payment_date: formData.payment_date ? `${formData.payment_date}T12:00:00` : undefined,
                    tracking_key: formData.tracking_key.trim() || undefined,
                    issuing_bank: formData.issuing_bank.trim() || undefined,
                    receipt_file_path: formData.receipt_file_path || undefined,
                    receipt_file_name: formData.receipt_file_name || undefined,
                    notes: formData.notes.trim() || undefined,
                },
                API_URL
            );

            toast.success("Abono registrado exitosamente con respaldo digital");
            setFormData({
                amount: "",
                method: "Transferencia",
                payment_date: new Date().toISOString().split("T")[0],
                tracking_key: "",
                issuing_bank: "",
                notes: "",
                receipt_file_path: "",
                receipt_file_name: "",
            });
            setExtractedBanner(null);
            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al registrar el abono");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registrar Abono — {invoice.invoice_number}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1 p-3 rounded-md bg-muted/50 border">
                        <Label className="text-xs text-muted-foreground">Saldo Pendiente Actual</Label>
                        <div className="text-lg font-bold">{formatCurrencyMXN(invoice.balance_due)}</div>
                    </div>

                    {/* Zona de Carga de Comprobante / Voucher SPEI */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            <span>Evidencia Digital (Comprobante SPEI / Ticket)</span>
                            <span className="text-[11px] font-normal normal-case text-primary">Extracción Asistida</span>
                        </Label>

                        <div className="border-2 border-dashed border-border rounded-lg p-3 text-center hover:bg-muted/30 transition-colors">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="receipt_file_upload"
                                disabled={extracting}
                            />

                            {extracting ? (
                                <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                    <p className="text-xs font-medium text-foreground">
                                        Subiendo a repositorio y extrayendo datos bancarios (SPEI / Banco / Importe)...
                                    </p>
                                </div>
                            ) : formData.receipt_file_name ? (
                                <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800 text-left">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <div className="truncate">
                                            <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200 truncate">
                                                {formData.receipt_file_name}
                                            </p>
                                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                                                Comprobante resguardado en S3 / MinIO
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-emerald-800 hover:text-red-600 shrink-0"
                                        onClick={handleClearReceipt}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="receipt_file_upload"
                                    className="cursor-pointer flex flex-col items-center justify-center py-2 space-y-1"
                                >
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                    <p className="text-xs font-medium text-foreground">
                                        Haz clic para adjuntar comprobante (PDF, JPG, PNG)
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        El sistema extraerá automáticamente el monto, clave SPEI y banco emisor
                                    </p>
                                </label>
                            )}
                        </div>

                        {extractedBanner && (
                            <div className="flex items-start gap-2 p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{extractedBanner}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
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

                        <div className="space-y-1.5">
                            <Label htmlFor="payment_date">Fecha de Operación *</Label>
                            <Input
                                id="payment_date"
                                type="date"
                                value={formData.payment_date}
                                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="method">Forma de Pago</Label>
                            <Select
                                onValueChange={(value) => setFormData({ ...formData, method: value })}
                                value={formData.method}
                            >
                                <SelectTrigger id="method">
                                    <SelectValue placeholder="Forma de pago" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Transferencia">Transferencia SPEI</SelectItem>
                                    <SelectItem value="Efectivo">Efectivo / Practicaja</SelectItem>
                                    <SelectItem value="Tarjeta">Tarjeta Bancaria</SelectItem>
                                    <SelectItem value="Cheque">Cheque Nominativo</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="issuing_bank">Institución Bancaria Emisora</Label>
                            <Input
                                id="issuing_bank"
                                placeholder="Ej: BBVA México, Banorte, Santander..."
                                value={formData.issuing_bank}
                                onChange={(e) => setFormData({ ...formData, issuing_bank: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="tracking_key">Clave de Rastreo Banxico / Folio SPEI</Label>
                        <Input
                            id="tracking_key"
                            placeholder="Ej: BNET01002610250001234567 o 2026102500000000..."
                            value={formData.tracking_key}
                            onChange={(e) => setFormData({ ...formData, tracking_key: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="notes">Referencia / Observaciones</Label>
                        <Input
                            id="notes"
                            placeholder="Notas internas o detalle de la acreditación..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || extracting}>
                            {loading ? "Registrando..." : "Registrar Abono"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
