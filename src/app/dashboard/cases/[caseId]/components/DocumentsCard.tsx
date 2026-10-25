"use client";

import {
    API_URL,
    getDocumentsForCase,
    initiateUpload,
    uploadFileToS3,
    getDownloadUrl,
    toggleDocumentVisibility,
    deleteDocument,
} from "@/app/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, FileText, Download, Trash2, Eye, EyeOff } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Document } from "@/app/types";

function formatBytes(bytes?: number): string {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DocumentsCard({ caseId }: { caseId: number }) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [shareByDefault, setShareByDefault] = useState(false);
    const [docToDelete, setDocToDelete] = useState<Document | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = useCallback(async () => {
        try {
            setIsLoading(true);
            const docs = await getDocumentsForCase(caseId, API_URL);
            setDocuments(docs);
        } catch {
            toast.error("No se pudieron cargar los documentos del expediente.");
        } finally {
            setIsLoading(false);
        }
    }, [caseId]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const { upload_url } = await initiateUpload(
                caseId,
                file.name,
                file.type || "application/octet-stream",
                file.size,
                API_URL,
                shareByDefault
            );
            await uploadFileToS3(upload_url, file);
            toast.success(`"${file.name}" incorporado al expediente digital.`);
            await fetchDocuments();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al subir el documento.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDownload = async (doc: Document) => {
        setIsDownloading(doc.id);
        try {
            const { download_url } = await getDownloadUrl(doc.id, API_URL);
            window.open(download_url, "_blank", "noopener,noreferrer");
        } catch {
            toast.error("No se pudo generar el enlace seguro de descarga.");
        } finally {
            setIsDownloading(null);
        }
    };

    const handleToggleVisibility = async (doc: Document) => {
        const nextValue = !doc.visible_to_client;
        try {
            const updated = await toggleDocumentVisibility(doc.id, nextValue, API_URL);
            setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updated : d)));
            toast.success(
                nextValue
                    ? "Documento habilitado en el Portal del Cliente"
                    : "Documento marcado como interno del despacho"
            );
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo cambiar la visibilidad");
        }
    };

    const handleConfirmDelete = async () => {
        if (!docToDelete) return;
        try {
            await deleteDocument(docToDelete.id, API_URL);
            setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
            toast.success("Documento eliminado del expediente");
            setDocToDelete(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo eliminar el documento");
        }
    };

    return (
        <Card className="mb-6 print:hidden">
            <CardHeader className="space-y-3">
                <div className="flex flex-row gap-3 items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Expediente Digital</CardTitle>
                        <CardDescription>Promociones, acuerdos, pruebas y anexos</CardDescription>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? "Subiendo..." : "Subir"}
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
                    <Label htmlFor="default-doc-vis" className="cursor-pointer font-normal text-muted-foreground">
                        Compartir nuevos archivos con el cliente al subir
                    </Label>
                    <Switch
                        id="default-doc-vis"
                        checked={shareByDefault}
                        onCheckedChange={setShareByDefault}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2.5">
                    {isLoading && (
                        <p className="text-sm text-muted-foreground py-3 text-center">
                            Cargando expediente digital...
                        </p>
                    )}
                    {!isLoading && documents.length === 0 && (
                        <p className="text-sm text-center text-muted-foreground py-6">
                            Aún no se han incorporado promociones o documentos a este expediente.
                        </p>
                    )}
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex flex-col gap-2 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2.5 min-w-0">
                                    <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate" title={doc.file_name}>
                                            {doc.file_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(doc.uploaded_at), "d MMM yyyy", { locale: es })}
                                            {doc.file_size_bytes ? ` • ${formatBytes(doc.file_size_bytes)}` : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDownload(doc)}
                                        disabled={isDownloading === doc.id}
                                        title="Descargar archivo"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => setDocToDelete(doc)}
                                        title="Eliminar archivo"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1.5 border-t border-dashed text-xs">
                                <Badge
                                    variant={doc.visible_to_client ? "default" : "secondary"}
                                    className={
                                        doc.visible_to_client
                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-none font-normal"
                                            : "font-normal"
                                    }
                                >
                                    {doc.visible_to_client ? (
                                        <>
                                            <Eye className="h-3 w-3 mr-1" /> Visible al Cliente
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="h-3 w-3 mr-1" /> Solo Despacho
                                        </>
                                    )}
                                </Badge>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground">Portal:</span>
                                    <Switch
                                        checked={doc.visible_to_client}
                                        onCheckedChange={() => handleToggleVisibility(doc)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            <AlertDialog open={!!docToDelete} onOpenChange={() => setDocToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar documento del expediente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará permanentemente el archivo <strong>{docToDelete?.file_name}</strong> del almacenamiento seguro.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
