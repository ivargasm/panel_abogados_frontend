import { createCaseUpdate } from "@/app/lib/api";
import { useAuthStore } from "@/app/store/Store";
import { CaseUpdate, CaseUpdateData } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import { toast } from "sonner";


export default function NewUpdateForm({ caseId, onUpdateCreated }: { caseId: number, onUpdateCreated: (newUpdate: CaseUpdate) => void }) {
    const [text, setText] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { url } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsSubmitting(true);
        const updateData: CaseUpdateData = {
            update_text: text,
            visible_to_client: isVisible,
            status: "Pendiente",
        };

        try {
            const newUpdate = await createCaseUpdate(caseId, updateData, url);
            onUpdateCreated(newUpdate);
            setText('');
            setIsVisible(false);
        } catch (error) {
            console.error("Failed to create update", error);
            toast.error("Error al crear la actualización");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
                placeholder="Añade una nueva actualización, nota o avance del caso..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                disabled={isSubmitting}
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Checkbox id="visible_to_client" checked={isVisible} onCheckedChange={(checked) => setIsVisible(Boolean(checked))} disabled={isSubmitting} />
                    <Label htmlFor="visible_to_client" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Visible para el cliente
                    </Label>
                </div>
                <Button type="submit" disabled={isSubmitting || !text.trim()}>
                    {isSubmitting ? 'Guardando...' : 'Añadir Actualización'}
                </Button>
            </div>
        </form>
    );
}