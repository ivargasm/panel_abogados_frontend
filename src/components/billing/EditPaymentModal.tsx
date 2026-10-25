"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileCheck, Loader2, Sparkles, X, ShieldCheck } from "lucide-react";
import { API_URL, uploadAndParseReceipt } from "@/app/lib/api";
import type { PaymentRecord } from "@/app/types";
import { formatCurrencyMXN } from "@/lib/legal-domain";

interface EditPaymentModalProps {
    payment: PaymentRecord | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditPaymentModal({ payment, isOpen, onClose }: EditPaymentModalProps) {
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("Transferencia");
    const [paymentDate, setPaymentDate] = useState("");
    const [trackingKey, setTrackingKey] = useState("");
    const [issuingBank, setIssuingBank] = useState("");
    const [notes, setNotes] = useState("");
    const [receiptFilePath, setReceiptFilePath] = useState("");
    const [receiptFileName, setReceiptFileName] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [extractedBanner, setExtractedBanner] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (payment) {
            setAmount(payment.amount?.toString() || "");
            setMethod(payment.method || "Transferencia");
            setPaymentDate(
                payment.payment_date
                    ? new Date(payment.payment_date).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
            );
            setTrackingKey(payment.tracking_key || "");
            setIssuingBank(payment.issuing_bank || "");
            setNotes(payment.notes || "");
            setReceiptFilePath(payment.receipt_file_path || "");
            setReceiptFileName(payment.receipt_file_name || "");
            setExtractedBanner(null);
        }
    }, [payment]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setExtracting(true);
        setExtractedBanner(null);

        try {
            const result = await uploadAndParseReceipt(file, API_URL);
            const { extracted_data, receipt_file_path, receipt_file_name } = result;

            if (extracted_data.amount && !amount) {
                setAmount(String(extracted_data.amount));
            }
            if (extracted_data.payment_date) {
                setPaymentDate(extracted_data.payment_date);
            }
            if (extracted_data.tracking_key) {
                setTrackingKey(extracted_data.tracking_key);
            }
            if (extracted_data.issuing_bank) {
                setIssuingBank(extracted_data.issuing_bank);
            }
            if (extracted_data.suggested_notes && !notes) {
                setNotes(extracted_data.suggested_notes);
            }

            setReceiptFilePath(receipt_file_path);
            setReceiptFileName(receipt_file_name);

            const details = [];
            if (extracted_data.amount) details.push(`Monto: ${formatCurrencyMXN(extracted_data.amount)}`);
            if (extracted_data.tracking_key) details.push(`Rastreo/Folio: ${extracted_data.tracking_key}`);
            if (extracted_data.issuing_bank) details.push(`Banco: ${extracted_data.issuing_bank}`);

            setExtractedBanner(
                `Comprobante procesado exitosamente (${details.join(" • ")}). Puedes ajustar cualquier campo antes de guardar.`
            );
            toast.success("Comprobante adjuntado y analizado");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al procesar el archivo");
        } finally {
            setExtracting(false);
        }
    };

    const handleClearReceipt = () => {
        setReceiptFilePath("");
        setReceiptFileName("");
        setExtractedBanner(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

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
                    payment_date: paymentDate ? new Date(paymentDate).toISOString() : undefined,
                    tracking_key: trackingKey.trim() || null,
                    issuing_bank: issuingBank.trim() || null,
                    receipt_file_path: receiptFilePath || null,
                    receipt_file_name: receiptFileName || null,
                    notes: notes.trim() || null,
                }),
            });

            if (response.ok) {
                toast.success("Abono y comprobante bancario actualizados");
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

    const isSpeiConfirmed = trackingKey && trackingKey.length >= 18;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[92vh] flex flex-col p-6 overflow-hidden">
                <DialogHeader className="shrink-0 pb-3 border-b">
                    <DialogTitle>Editar Abono de Honorarios</DialogTitle>
                    <DialogDescription>
                        Modifica los importes, actualiza el folio o adjunta el comprobante oficial CEP / Banxico.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-2">
                        {/* Evidencia Digital (Comprobante / Ticket) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Evidencia Digital (Comprobante / Ticket / CEP)
                                </Label>
                                {isSpeiConfirmed ? (
                                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                                        <ShieldCheck className="h-3.5 w-3.5" /> Clave Banxico detectada
                                    </span>
                                ) : trackingKey ? (
                                    <span className="text-[11px] text-amber-600 font-medium">
                                        Folio Bancario / En Tránsito
                                    </span>
                                ) : null}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,image/png,image/jpeg,image/jpg"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {receiptFilePath ? (
                                <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <div className="truncate">
                                            <p className="font-semibold text-foreground truncate">
                                                {receiptFileName || "Comprobante bancario"}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Resguardado en bóveda digital S3 / MinIO
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-7 text-xs"
                                        >
                                            Sustituir
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleClearReceipt}
                                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-border rounded-lg p-3 text-center cursor-pointer hover:border-primary/60 hover:bg-muted/40 transition-colors"
                                >
                                    {extracting ? (
                                        <div className="flex items-center justify-center gap-2 py-2 text-xs text-primary font-medium">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Analizando comprobante y extrayendo folios...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 py-1">
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                            <p className="text-xs font-medium text-foreground">
                                                Arrastra o selecciona el comprobante bancario (PDF o Imagen)
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Extrae automáticamente folios, montos, fechas y bancos
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

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
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="paymentDate">Fecha de Operación *</Label>
                                <Input
                                    id="paymentDate"
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="method">Forma de Pago</Label>
                                <Select value={method} onValueChange={setMethod} required>
                                    <SelectTrigger id="method">
                                        <SelectValue placeholder="Selecciona forma de pago" />
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
                                <Label htmlFor="issuingBank">Institución Bancaria Emisora</Label>
                                <Input
                                    id="issuingBank"
                                    placeholder="Ej: BBVA México, Banorte, Santander..."
                                    value={issuingBank}
                                    onChange={(e) => setIssuingBank(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="trackingKey">Folio Bancario / Clave de Rastreo SPEI</Label>
                            <Input
                                id="trackingKey"
                                placeholder="Ej: 20261025... o Folio: 849201"
                                value={trackingKey}
                                onChange={(e) => setTrackingKey(e.target.value)}
                            />
                            <span className="text-[11px] text-muted-foreground">
                                Permite folios móviles temporales o la clave Banxico CEP de 20-30 caracteres.
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="notes">Referencia / Observaciones</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                placeholder="Notas internas sobre la liquidación o referencia de transferencia..."
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-3 border-t mt-2 shrink-0 flex items-center justify-end gap-2 bg-background">
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
