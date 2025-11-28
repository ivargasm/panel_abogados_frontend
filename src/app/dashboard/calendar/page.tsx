// app/dashboard/calendar/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventSourceInput, EventClickArg, DateSelectArg } from '@fullcalendar/core/index.js';

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar"; // Assuming this exists, otherwise we'll use a simple date picker or custom implementation
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

// Business Logic Imports
import { useAuthStore } from '@/app/store/Store';
import { getCases, createCalendarEvent, getCalendarEvents, updateCalendarEvent, deleteCalendarEvent } from '@/app/lib/api';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import { Case, CalendarEventData, CalendarEvent as CalendarEventType } from '@/app/types';

const EVENT_TYPES = [
    { id: "Audiencia", label: "Audiencia", color: "bg-red-500" },
    { id: "Vencimiento", label: "Vencimiento", color: "bg-amber-500" },
    { id: "Reunión", label: "Reunión", color: "bg-blue-500" },
    { id: "Notificación", label: "Notificación", color: "bg-purple-500" },
    { id: "Otro", label: "Otro", color: "bg-gray-500" }
];

const EVENT_STATUSES = ["Pendiente", "Completado", "Cancelado"];

// --- Event Form Component ---
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
        }
    }, [event]);

    const handleSubmit = async (e: React.FormEvent) => {
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
            status: formData.status,
        };
        await onSave(payload);
        onFinish();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="title">Título del Evento</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej. Audiencia Preliminar"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Fecha</Label>
                    <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Hora</Label>
                    <Input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Tipo de Evento</Label>
                    <Select value={formData.event_type} onValueChange={(val) => setFormData({ ...formData, event_type: val })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EVENT_TYPES.map(type => (
                                <SelectItem key={type.id} value={type.id}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${type.color}`} />
                                        {type.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Estado</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EVENT_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Caso Relacionado (Opcional)</Label>
                <Select value={formData.case_id} onValueChange={(val) => setFormData({ ...formData, case_id: val })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar caso..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Ninguno</SelectItem>
                        {cases.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label>Ubicación</Label>
                <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-8"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ej. Juzgado 4to Civil"
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Descripción</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalles adicionales..."
                />
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
                {event ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
                                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : <div />}
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onFinish}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </DialogFooter>
        </form>
    );
}

// --- Main Calendar Page Component ---
export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | null>(null);
    const [cases, setCases] = useState<Case[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<string[]>(EVENT_TYPES.map(t => t.id));
    const calendarRef = useRef<FullCalendar>(null);
    const { url } = useAuthStore();

    // Fetch initial data
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const data = await getCases(url, null);
                setCases(data);
            } catch (error) {
                console.error("Failed to fetch cases", error);
            }
        };
        fetchCases();
    }, [url]);

    // Handlers
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleDateSelect = (selectInfo: DateSelectArg) => {
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    const handleEventClick = (clickInfo: EventClickArg) => {
        const event = clickInfo.event.extendedProps.fullEventObject;
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleSaveEvent = async (data: CalendarEventData) => {
        try {
            if (selectedEvent) {
                await updateCalendarEvent(selectedEvent.id, data, url);
                toast.success("Evento actualizado");
            } else {
                await createCalendarEvent(data, url);
                toast.success("Evento creado");
            }
            calendarRef.current?.getApi().refetchEvents();
        } catch {
            toast.error("Error al guardar evento");
        }
    };

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;
        try {
            await deleteCalendarEvent(selectedEvent.id, url);
            toast.success("Evento eliminado");
            calendarRef.current?.getApi().refetchEvents();
            setIsModalOpen(false);
        } catch {
            toast.error("Error al eliminar evento");
        }
    };

    const handleMiniCalendarSelect = (newDate: Date | undefined) => {
        if (newDate && calendarRef.current) {
            setDate(newDate);
            calendarRef.current.getApi().gotoDate(newDate);
        }
    };

    const fetchEvents: EventSourceInput = async (fetchInfo, successCallback, failureCallback) => {
        try {
            const events = await getCalendarEvents(fetchInfo.start.toISOString(), fetchInfo.end.toISOString(), url, null);

            // Client-side filtering
            const filteredEvents = events.filter((event: { title: string; event_type: string; }) => {
                const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = selectedTypes.includes(event.event_type);
                return matchesSearch && matchesType;
            });

            const formattedEvents = filteredEvents.map((event: { id: number; title: string; start_time: string; end_time: string; is_all_day: boolean; event_type: string; }) => ({
                id: String(event.id),
                title: event.title,
                start: event.start_time,
                end: event.end_time,
                allDay: event.is_all_day,
                backgroundColor: EVENT_TYPES.find(t => t.id === event.event_type)?.color.replace('bg-', 'var(--') || '#3b82f6', // Fallback color logic needs refinement for proper CSS var usage or direct hex
                classNames: [
                    event.event_type === 'Audiencia' ? 'bg-red-500 border-red-600' :
                        event.event_type === 'Vencimiento' ? 'bg-amber-500 border-amber-600' :
                            event.event_type === 'Reunión' ? 'bg-blue-500 border-blue-600' :
                                event.event_type === 'Notificación' ? 'bg-purple-500 border-purple-600' :
                                    'bg-gray-500 border-gray-600'
                ],
                extendedProps: { fullEventObject: event }
            }));
            successCallback(formattedEvents);
        } catch (error) {
            failureCallback(error as Error);
        }
    };

    // Trigger refetch when filters change
    useEffect(() => {
        calendarRef.current?.getApi().refetchEvents();
    }, [searchTerm, selectedTypes]);

    return (
        <ProtectedRoute>
            <div className="flex flex-col gap-4 h-auto lg:h-[calc(100vh-2rem)]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full min-h-0">

                    {/* Sidebar */}
                    <Card className="lg:col-span-3 flex flex-col lg:h-full border-none shadow-none bg-transparent lg:bg-card lg:border lg:shadow-sm">
                        <div className="p-4 space-y-6">
                            <Button
                                className="w-full justify-start text-lg h-12"
                                size="lg"
                                onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
                            >
                                <Plus className="mr-2 h-5 w-5" /> Añadir Evento
                            </Button>

                            <div className="rounded-md border bg-card w-fit mx-auto lg:mx-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleMiniCalendarSelect}
                                    locale={es}
                                    className="rounded-md border shadow-sm"
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Filtros</h3>

                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar eventos..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="all"
                                            checked={selectedTypes.length === EVENT_TYPES.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedTypes(EVENT_TYPES.map(t => t.id));
                                                else setSelectedTypes([]);
                                            }}
                                        />
                                        <label htmlFor="all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Todos los eventos
                                        </label>
                                    </div>
                                    <Separator className="my-2" />
                                    {EVENT_TYPES.map(type => (
                                        <div key={type.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={type.id}
                                                checked={selectedTypes.includes(type.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setSelectedTypes([...selectedTypes, type.id]);
                                                    else setSelectedTypes(selectedTypes.filter(t => t !== type.id));
                                                }}
                                            />
                                            <div className={`w-3 h-3 rounded-full ${type.color}`} />
                                            <label htmlFor={type.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {type.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Main Calendar Area */}
                    <Card className="lg:col-span-9 flex flex-col h-[600px] lg:h-full border-none shadow-none bg-transparent lg:bg-card lg:border lg:shadow-sm">
                        <CardContent className="p-0 h-full flex flex-col">
                            <div className="flex-1 p-4 h-full max-w-full overflow-x-auto">
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                                    }}
                                    locale="es"
                                    buttonText={{
                                        today: 'Hoy',
                                        month: 'Mes',
                                        week: 'Semana',
                                        day: 'Día',
                                        list: 'Agenda'
                                    }}
                                    height="100%"
                                    selectable={true}
                                    selectMirror={true}
                                    dayMaxEvents={true}
                                    weekends={true}
                                    events={fetchEvents}
                                    select={handleDateSelect}
                                    eventClick={handleEventClick}
                                    eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Event Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{selectedEvent ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle>
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
            </div>
        </ProtectedRoute>
    );
}
