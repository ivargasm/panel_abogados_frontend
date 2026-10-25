// src/lib/legal-domain.ts
// Catálogos y nomenclatura procesal mexicana para LexControl.

export const LEGAL_MATTERS = [
    "Civil",
    "Familiar",
    "Mercantil",
    "Laboral",
    "Penal",
    "Amparo",
    "Administrativo",
    "Fiscal",
    "Corporativo",
    "Agrario",
] as const;

export const PROCEDURAL_ROLES = [
    "Actor / Demandante",
    "Demandado",
    "Quejoso",
    "Tercero Interesado",
    "Víctima u Ofendido",
    "Imputado",
    "Promovente",
    "Recurrente / Apelante",
] as const;

export const CASE_STATUS_OPTIONS = [
    { value: "active", label: "Radicado / En Trámite" },
    { value: "discovery", label: "Etapa Probatoria / Instrucción" },
    { value: "trial", label: "Alegatos / Citación a Sentencia" },
    { value: "on_hold", label: "Suspendido / En Amparo" },
    { value: "closed", label: "Concluido / Cosa Juzgada" },
] as const;

export const CASE_STATUS_LABELS: Record<string, string> = {
    active: "Radicado / En Trámite",
    discovery: "Etapa Probatoria / Instrucción",
    trial: "Alegatos / Citación a Sentencia",
    on_hold: "Suspendido / En Amparo",
    closed: "Concluido / Cosa Juzgada",
};

export const CASE_STATUS_STYLES: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    discovery: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
    trial: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
    on_hold: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    closed: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

export function getCaseStatusLabel(status?: string | null): string {
    if (!status) return "En Trámite";
    return CASE_STATUS_LABELS[status] || status;
}

export function getCaseStatusStyle(status?: string | null): string {
    if (!status) return CASE_STATUS_STYLES.active;
    return CASE_STATUS_STYLES[status] || CASE_STATUS_STYLES.active;
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
    draft: "Borrador",
    sent: "Pendiente de Pago",
    partial: "Pago Parcial",
    paid: "Liquidado",
    overdue: "Vencido",
    cancelled: "Cancelado",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    Efectivo: "Efectivo",
    Transferencia: "Transferencia SPEI",
    Tarjeta: "Tarjeta Bancaria",
    Cheque: "Cheque Nominativo",
    Otro: "Otro",
    cash: "Efectivo",
    transfer: "Transferencia SPEI",
    card: "Tarjeta Bancaria",
    check: "Cheque Nominativo",
    other: "Otro",
};

export function formatCurrencyMXN(amount?: number | null): string {
    const val = typeof amount === "number" && !Number.isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    }).format(val);
}
