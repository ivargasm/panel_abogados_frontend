// app/dashboard/calendar/page.tsx
// Versión final con edición, borrado y cambio de estado de eventos.

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Trash2, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';

// Importaciones de FullCalendar y date-fns
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventSourceInput, EventClickArg } from '@fullcalendar/core/index.js';
import { format, parseISO } from 'date-fns';

// Importaciones de componentes de shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Importaciones de tu lógica de negocio
import { useAuthStore } from '@/app/store/Store';
import { getCases, createCalendarEvent, getCalendarEvents, updateCalendarEvent, deleteCalendarEvent, downloadCalendarEventIcs } from '@/app/lib/api';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import { Case, CalendarEventData, CalendarEvent as CalendarEventType } from '@/app/types';

const EVENT_TYPES = ["Audiencia", "Vencimiento", "Reunión", "Notificación", "Otro"];
const EVENT_STATUSES = ["Pendiente", "Completado", "Cancelado"];

// --- Componente del Formulario (Ahora maneja Crear y Editar) ---
function EventForm({ event, cases, onSave, onFinish, onDelete }: { event: CalendarEventType | null, cases: Case[], onSave: (data: CalendarEventData) => Promise<void>, onFinish: () => void, onDelete: () => Promise<void> }) {
    const [formData, setFormData] = useState({
        title: '',
        event_type: 'Otro',
        case_id: '0',
        location: '',
        description: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        status: 'Pendiente',
    });
    const [isDownloading, setIsDownloading] = useState(false);
    const { url } = useAuthStore();

    useEffect(() => {
        if (event) {
            const startDate = parseISO(event.start_time);
            setFormData({
                title: event.title,
                event_type: event.event_type,
                case_id: String(event.case_id || '0'),
                location: event.location || '',
                description: event.description || '',
                start_date: format(startDate, 'yyyy-MM-dd'),
                start_time: format(startDate, 'HH:mm'),
                status: event.status,
            });
        } else {
            // Resetea para el modo creación
            setFormData({
                title: '', event_type: 'Otro', case_id: '0', location: '',
                description: '', start_date: format(new Date(), 'yyyy-MM-dd'), start_time: '09:00', status: 'Pendiente'
            });
        }
    }, [event]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const startDateTimeString = `${formData.start_date}T${formData.start_time}:00`;
        const payload: CalendarEventData = {
            title: formData.title,
            description: formData.description || null,
            start_time: startDateTimeString,
            is_all_day: false,
            event_type: formData.event_type,
            case_id: Number(formData.case_id) > 0 ? Number(formData.case_id) : null,
            location: formData.location || null,
            status: formData.status as string,
        };
        await onSave(payload);
        onFinish();
    };

    const handleDownload = async () => {
        if (!event) return;
        setIsDownloading(true);
        try {
            await downloadCalendarEventIcs(event.id, url);
        } catch {
            toast.error("No se pudo generar el archivo .ics");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Título</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_time" className="text-right">Fecha y Hora</Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                    <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleInputChange} />
                    <Input id="start_time" name="start_time" type="time" value={formData.start_time} onChange={handleInputChange} />
                </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Juzgado/Lugar</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleInputChange} className="col-span-3" placeholder="Ej. Juzgado 3ro Civil, Sala 2" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event_type" className="text-right">Tipo</Label>
                <Select value={formData.event_type} onValueChange={(value) => setFormData(prev => ({...prev, event_type: value}))}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {EVENT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({...prev, status: value}))}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {EVENT_STATUSES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="case_id" className="text-right">Caso Asociado</Label>
                <Select value={formData.case_id} onValueChange={(value) => setFormData(prev => ({...prev, case_id: value}))}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="(Opcional)" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Ninguno</SelectItem>
                        {cases.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.title} - <span className="text-muted-foreground ml-1">{c.client.full_name}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">Descripción</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="col-span-3" placeholder="Añade notas o detalles adicionales..." />
            </div>
            <DialogFooter className="flex justify-between w-full">
                <div>
                    {event && ( // Solo mostrar el botón de eliminar si estamos editando
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" className='mb-2'>
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={onDelete}>Sí, eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    {event && (
                        <Button type="button" variant="outline" onClick={handleDownload} disabled={isDownloading}>
                            <CalendarPlus className="mr-2 h-4 w-4" />
                            {isDownloading ? 'Generando...' : 'Añadir a Calendario'}
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onFinish}>Cancelar</Button>
                    <Button type="submit">Guardar Cambios</Button>
                </div>
            </DialogFooter>
        </form>
    );
}

// --- Componente Principal de la Página de Calendario ---
export default function CalendarPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | null>(null);
    const [cases, setCases] = useState<Case[]>([]);
    const [filterCaseId, setFilterCaseId] = useState<number | null>(null);
    const calendarRef = useRef<FullCalendar>(null);
    const { url } = useAuthStore();

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const casesData = await getCases(url, null);
                setCases(casesData);
            } catch {
                toast.error("No se pudieron cargar los casos para el formulario.");
            }
        };
        fetchCases();
    }, [url]);
    
    const handleFilterChange = (caseIdValue: string) => {
        const newCaseId = Number(caseIdValue) > 0 ? Number(caseIdValue) : null;
        setFilterCaseId(newCaseId);
        // Forzamos a FullCalendar a que vuelva a pedir los eventos con el nuevo filtro
        calendarRef.current?.getApi().refetchEvents();
    };

    const handleDateClick = () => {
        setSelectedEvent(null); // Aseguramos que estamos en modo creación
        setIsModalOpen(true);
    };

    const handleEventClick = (clickInfo: EventClickArg) => {
        const eventId = clickInfo.event.id;
        const fullEvent = calendarRef.current?.getApi().getEventById(eventId)?.extendedProps.fullEventObject;
        setSelectedEvent(fullEvent || null);
        setIsModalOpen(true);
    };
    
    const handleSaveEvent = async (eventData: CalendarEventData) => {
        try {
            if (selectedEvent) {
                await updateCalendarEvent(selectedEvent.id, eventData, url);
                toast.success("Evento actualizado con éxito.");
            } else {
                await createCalendarEvent(eventData, url);
                toast.success("Evento creado con éxito.");
            }
            calendarRef.current?.getApi().refetchEvents();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'No se pudo guardar el evento');
        }
    };
    
    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;
        try {
            await deleteCalendarEvent(selectedEvent.id, url);
            toast.success("Evento eliminado con éxito.");
            calendarRef.current?.getApi().refetchEvents();
            setIsModalOpen(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'No se pudo eliminar el evento');
        }
    };

    const fetchEvents: EventSourceInput = async (fetchInfo, successCallback, failureCallback) => {
        try {
            // Pasamos el `filterCaseId` del estado a la función de la API
            const events: CalendarEventType[] = await getCalendarEvents(fetchInfo.start.toISOString(), fetchInfo.end.toISOString(), url, filterCaseId);
            const formattedEvents = events.map(event => ({
                id: String(event.id),
                title: event.title,
                start: event.start_time,
                end: event.end_time || undefined,
                allDay: event.is_all_day,
                className: event.status === 'Completado' ? 'opacity-50 bg-green-900 border-green-700' : event.status === 'Cancelado' ? 'opacity-50 bg-gray-700 border-gray-600 line-through' : '',
                color: event.event_type === 'Audiencia' ? '#dc2626' : event.event_type === 'Vencimiento' ? '#f59e0b' : '#0ea5e9',
                extendedProps: { fullEventObject: event }
            }));
            successCallback(formattedEvents);
        } catch (error) {
            failureCallback(error as Error);
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Calendario</h1>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Select onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-full sm:w-[250px]">
                            <SelectValue placeholder="Filtrar por caso..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Todos los casos</SelectItem>
                            {cases.map(c => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.title} - <span className="text-muted-foreground ml-1">{c.client.full_name}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Evento
                    </Button>
                </div>
            </div>
            <Card>
                <CardContent className="p-4">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        events={fetchEvents}
                        locale="es"
                        buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
                        selectable={true}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        height="auto"
                    />
                </CardContent>
            </Card>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>{selectedEvent ? 'Editar Evento' : 'Añadir Nuevo Evento'}</DialogTitle>
                    </DialogHeader>
                    <EventForm
                        event={selectedEvent}
                        cases={cases}
                        onSave={handleSaveEvent}
                        onDelete={handleDeleteEvent}
                        onFinish={() => setIsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </ProtectedRoute>
    );
}
