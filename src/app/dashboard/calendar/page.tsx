// app/dashboard/calendar/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, MapPin, Trash2, Download, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { EventSourceInput, EventClickArg, DateSelectArg } from "@fullcalendar/core/index.js";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

import {
    API_URL,
    getCases,
    createCalendarEvent,
    getCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent,
    downloadCalendarEventIcs,
} from "@/app/lib/api";
import type { Case, CalendarEventData, CalendarEvent as CalendarEventType } from "@/app/types";

const EVENT_TYPES = [
    { id: "Audiencia", label: "Audiencia Judicial", color: "bg-red-500", hex: "#dc2626" },
    { id: "Vencimiento", label: "Término / Vencimiento", color: "bg-amber-500", hex: "#d97706" },
    { id: "Reunión", label: "Reunión con Cliente", color: "bg-sky-600", hex: "#0284c7" },
    { id: "Notificación", label: "Diligencia / Notificación", color: "bg-purple-600", hex: "#9333ea" },
    { id: "Otro", label: "Otro", color: "bg-slate-500", hex: "#64748b" },
];

const EVENT_STATUSES = ["Pendiente", "Completado", "Cancelado"];

function EventForm({
    event,
    initialDate,
    initialTime,
    cases,
    onSave,
    onFinish,
    onDelete,
}: {
    event: CalendarEventType | null;
    initialDate: string;
    initialTime: string;
    cases: Case[];
    onSave: (data: CalendarEventData) => Promise<void>;
    onFinish: () => void;
    onDelete: () => Promise<void>;
}) {
    const [formData, setFormData] = useState({
        title: "",
        event_type: "Audiencia",
        is_fatal_deadline: false,
        case_id: "0",
        location: "",
        description: "",
        start_date: initialDate,
        start_time: initialTime,
        status: "Pendiente",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (event) {
            const startDate = parseISO(event.start_time);
            setFormData({
                title: event.title,
                event_type: event.event_type,
                is_fatal_deadline: Boolean(event.is_fatal_deadline),
                case_id: String(event.case_id || "0"),
                location: event.location || "",
                description: event.description || "",
                start_date: format(startDate, "yyyy-MM-dd"),
                start_time: format(startDate, "HH:mm"),
                status: event.status,
            });
        } else {
            setFormData({
                title: "",
                event_type: "Audiencia",
                is_fatal_deadline: false,
                case_id: "0",
                location: "",
                description: "",
                start_date: initialDate,
                start_time: initialTime,
                status: "Pendiente",
            });
        }
    }, [event, initialDate, initialTime]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const startDateTimeString = `${formData.start_date}T${formData.start_time}:00`;
            const payload: CalendarEventData = {
                title: formData.title.trim(),
                description: formData.description.trim() || null,
                start_time: startDateTimeString,
                is_all_day: false,
                event_type: formData.event_type,
                is_fatal_deadline: formData.is_fatal_deadline,
                case_id: Number(formData.case_id) > 0 ? Number(formData.case_id) : null,
                location: formData.location.trim() || null,
                status: formData.status,
            };
            await onSave(payload);
            onFinish();
        } finally {
            setSaving(false);
        }
    };

    const handleExportIcs = async () => {
        if (!event) return;
        try {
            await downloadCalendarEventIcs(event.id, API_URL);
            toast.success("Archivo iCalendar (.ics) descargado");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al exportar a calendario");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid gap-2">
                <Label htmlFor="title">Concepto de la Audiencia o Término *</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Audiencia Constitucional / Vence contestación de demanda"
                    required
                />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/30 p-3">
                <div className="flex items-start gap-2.5">
                    <AlertOctagon className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <div>
                        <Label htmlFor="fatal-switch" className="text-sm font-semibold text-red-900 dark:text-red-300 cursor-pointer">
                            Término Procesal Fatal / Improrrogable
                        </Label>
                        <p className="text-xs text-red-700/90 dark:text-red-300/80">
                            Activa máxima prioridad en el semáforo de vencimientos del despacho.
                        </p>
                    </div>
                </div>
                <Switch
                    id="fatal-switch"
                    checked={formData.is_fatal_deadline}
                    onCheckedChange={(checked) =>
                        setFormData({
                            ...formData,
                            is_fatal_deadline: checked,
                            event_type: checked && formData.event_type === "Otro" ? "Vencimiento" : formData.event_type,
                        })
                    }
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Fecha *</Label>
                    <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Hora *</Label>
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
                    <Label>Clasificación</Label>
                    <Select
                        value={formData.event_type}
                        onValueChange={(val) => setFormData({ ...formData, event_type: val })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EVENT_TYPES.map((type) => (
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
                    <Label>Estatus</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(val) => setFormData({ ...formData, status: val })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EVENT_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Expediente Relacionado (Visible al Cliente si aplica)</Label>
                <Select
                    value={formData.case_id}
                    onValueChange={(val) => setFormData({ ...formData, case_id: val })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar expediente..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Agenda interna (sin expediente)</SelectItem>
                        {cases.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.judicial_file_number ? `[${c.judicial_file_number}] ` : ""}
                                {c.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label>Juzgado, Sala o Ubicación</Label>
                <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-8"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ej: Juzgado Quinto Civil, Sala de Oralidad 2"
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Observaciones e Instrucciones</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Documentos a exhibir, pliego de posiciones, testigos citados..."
                    rows={3}
                />
            </div>

            <DialogFooter className="flex flex-wrap gap-2 justify-between sm:justify-between pt-2">
                {event ? (
                    <div className="flex items-center gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" size="icon" title="Eliminar evento">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar evento de la agenda?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción retirará la audiencia o término de la agenda del despacho.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={onDelete}>Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleExportIcs}
                            title="Sincronizar con Google Calendar, Apple Calendar u Outlook"
                        >
                            <Download className="h-4 w-4 mr-1.5" />
                            Exportar .ics
                        </Button>
                    </div>
                ) : (
                    <div />
                )}
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onFinish}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Guardando..." : "Guardar en Agenda"}
                    </Button>
                </div>
            </DialogFooter>
        </form>
    );
}

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | null>(null);
    const [prefillDate, setPrefillDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [prefillTime, setPrefillTime] = useState("09:00");
    const [cases, setCases] = useState<Case[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>(EVENT_TYPES.map((t) => t.id));
    const calendarRef = useRef<FullCalendar>(null);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const data = await getCases(API_URL, null);
                setCases(data);
            } catch (error) {
                console.error("Failed to fetch cases", error);
            }
        };
        fetchCases();
    }, []);

    const handleDateSelect = (selectInfo: DateSelectArg) => {
        setSelectedEvent(null);
        const raw = selectInfo.startStr;
        if (raw.includes("T")) {
            const parsed = parseISO(raw);
            setPrefillDate(format(parsed, "yyyy-MM-dd"));
            setPrefillTime(format(parsed, "HH:mm"));
        } else {
            setPrefillDate(raw.slice(0, 10));
            setPrefillTime("09:00");
        }
        setIsModalOpen(true);
    };

    const handleEventClick = (clickInfo: EventClickArg) => {
        const event = clickInfo.event.extendedProps.fullEventObject as CalendarEventType;
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleSaveEvent = async (data: CalendarEventData) => {
        try {
            if (selectedEvent) {
                await updateCalendarEvent(selectedEvent.id, data, API_URL);
                toast.success("Agenda procesal actualizada");
            } else {
                await createCalendarEvent(data, API_URL);
                toast.success("Audiencia o término agendado");
            }
            calendarRef.current?.getApi().refetchEvents();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al guardar el evento");
            throw err;
        }
    };

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;
        try {
            await deleteCalendarEvent(selectedEvent.id, API_URL);
            toast.success("Evento eliminado de la agenda");
            calendarRef.current?.getApi().refetchEvents();
            setIsModalOpen(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al eliminar el evento");
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
            const events: CalendarEventType[] = await getCalendarEvents(
                fetchInfo.start.toISOString(),
                fetchInfo.end.toISOString(),
                API_URL,
                null
            );

            const filteredEvents = events.filter((event) => {
                const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = selectedTypes.includes(event.event_type);
                return matchesSearch && matchesType;
            });

            const formattedEvents = filteredEvents.map((event) => {
                const typeDef = EVENT_TYPES.find((t) => t.id === event.event_type);
                const bgHex = event.is_fatal_deadline ? "#991b1b" : typeDef?.hex || "#3b82f6";
                return {
                    id: String(event.id),
                    title: event.is_fatal_deadline ? `⚠ FATAL: ${event.title}` : event.title,
                    start: event.start_time,
                    end: event.end_time || undefined,
                    allDay: event.is_all_day,
                    backgroundColor: bgHex,
                    borderColor: bgHex,
                    extendedProps: { fullEventObject: event },
                };
            });
            successCallback(formattedEvents);
        } catch (error) {
            failureCallback(error as Error);
        }
    };

    useEffect(() => {
        calendarRef.current?.getApi().refetchEvents();
    }, [searchTerm, selectedTypes]);

    return (
        <div className="flex flex-col gap-4 h-auto lg:h-[calc(100vh-7rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full min-h-0">
                {/* Panel lateral */}
                <Card className="lg:col-span-3 flex flex-col lg:h-full overflow-y-auto">
                    <div className="p-4 space-y-5">
                        <Button
                            className="w-full justify-start text-base h-11"
                            onClick={() => {
                                setSelectedEvent(null);
                                setPrefillDate(format(date || new Date(), "yyyy-MM-dd"));
                                setPrefillTime("09:00");
                                setIsModalOpen(true);
                            }}
                        >
                            <Plus className="mr-2 h-5 w-5" /> Agendar Audiencia / Término
                        </Button>

                        <div className="rounded-md border bg-card w-fit mx-auto lg:mx-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleMiniCalendarSelect}
                                locale={es}
                                className="rounded-md"
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                                Filtros de Agenda Judicial
                            </h3>

                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar audiencia o término..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="all"
                                        checked={selectedTypes.length === EVENT_TYPES.length}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedTypes(EVENT_TYPES.map((t) => t.id));
                                            else setSelectedTypes([]);
                                        }}
                                    />
                                    <label htmlFor="all" className="text-sm font-medium cursor-pointer">
                                        Mostrar todos
                                    </label>
                                </div>
                                <Separator />
                                {EVENT_TYPES.map((type) => (
                                    <div key={type.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={type.id}
                                            checked={selectedTypes.includes(type.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedTypes([...selectedTypes, type.id]);
                                                else setSelectedTypes(selectedTypes.filter((t) => t !== type.id));
                                            }}
                                        />
                                        <div className={`w-3 h-3 rounded-full ${type.color}`} />
                                        <label htmlFor={type.id} className="text-sm cursor-pointer">
                                            {type.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Calendario Principal */}
                <Card className="lg:col-span-9 flex flex-col h-[620px] lg:h-full">
                    <CardContent className="p-0 h-full flex flex-col">
                        <div className="flex-1 p-4 h-full max-w-full overflow-x-auto">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: "prev,next today",
                                    center: "title",
                                    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                                }}
                                locale="es"
                                buttonText={{
                                    today: "Hoy",
                                    month: "Mes",
                                    week: "Semana",
                                    day: "Día",
                                    list: "Agenda",
                                }}
                                height="100%"
                                selectable={true}
                                selectMirror={true}
                                dayMaxEvents={true}
                                weekends={true}
                                events={fetchEvents}
                                select={handleDateSelect}
                                eventClick={handleEventClick}
                                eventClassNames="cursor-pointer hover:opacity-90 transition-opacity text-xs font-medium"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[540px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedEvent ? "Detalle de Audiencia o Término" : "Agendar Audiencia o Término Procesal"}
                        </DialogTitle>
                        <DialogDescription>
                            Registra fechas de desahogo, vencimientos de ley o citas con clientes y expórtalos a tu calendario móvil.
                        </DialogDescription>
                    </DialogHeader>
                    <EventForm
                        event={selectedEvent}
                        initialDate={prefillDate}
                        initialTime={prefillTime}
                        cases={cases}
                        onSave={handleSaveEvent}
                        onDelete={handleDeleteEvent}
                        onFinish={() => setIsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
