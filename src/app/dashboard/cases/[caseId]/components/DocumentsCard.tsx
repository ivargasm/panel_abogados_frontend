import { getDocumentsForCase, initiateUpload, uploadFileToS3, getDownloadUrl } from "@/app/lib/api";
import { useAuthStore } from "@/app/store/Store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Progress } from "@radix-ui/react-progress";
import { Upload, FileText, Download } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Document } from '@/app/types';


export default function DocumentsCard({ caseId }: { caseId: number }) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState<number | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { url } = useAuthStore();

    const fetchDocuments = useCallback(async () => {
        try {
            setIsLoading(true);
            const docs = await getDocumentsForCase(caseId, url);
            setDocuments(docs);
        } catch {
            toast.error("No se pudieron cargar los documentos.");
        } finally {
            setIsLoading(false);
        }
    }, [caseId, url]);

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
        setUploadProgress(0);
        try {
            // 1. Pedir la URL pre-firmada al backend
            const { upload_url } = await initiateUpload(caseId, file.name, file.type, url);
            
            // 2. Subir el archivo directamente a S3
            // Nota: El seguimiento del progreso real requiere XHR/Axios.
            // Con fetch, simulamos un progreso simple.
            await uploadFileToS3(upload_url, file);
            setUploadProgress(100);
            
            toast.success(`'${file.name}' subido con éxito.`);
            
            // 3. Refrescar la lista de documentos
            await fetchDocuments();

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al subir el archivo.");
        } finally {
            setUploadProgress(null);
            // Resetear el input para poder subir el mismo archivo de nuevo
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDownload = async (doc: Document) => {
        setIsDownloading(doc.id);
        try {
            const { download_url } = await getDownloadUrl(doc.id, url);
            // Abrir la URL en una nueva pestaña para iniciar la descarga del navegador.
            window.open(download_url, '_blank');
        } catch {
            toast.error("No se pudo generar el enlace de descarga.");
        } finally {
            setIsDownloading(null);
        }
    };

    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row gap-4 items-center justify-between">
                <CardTitle>Documentos</CardTitle>
                <Button size="sm" onClick={() => fileInputRef.current?.click()} className='cursor-pointer'>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Archivo
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </CardHeader>
            <CardContent>
                {uploadProgress !== null && (
                    <div className="mb-4">
                        <Label>Subiendo...</Label>
                        <Progress value={uploadProgress} className="w-full" />
                    </div>
                )}
                <div className="space-y-2">
                    {isLoading && <p>Cargando documentos...</p>}
                    {!isLoading && documents.length === 0 && (
                        <p className="text-sm text-center text-muted-foreground py-4">No hay documentos en este caso.</p>
                    )}
                    {documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">{doc.file_name}</span>
                            </div>
                            {/* La descarga segura desde S3 requiere URLs pre-firmadas de GET,
                                que se pueden implementar en un paso posterior. */}
                            <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} disabled={isDownloading === doc.id} className='cursor-pointer'>
                                {isDownloading === doc.id ? (
                                    <div className="h-4 w-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}