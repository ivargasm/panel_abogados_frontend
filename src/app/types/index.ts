// types/index.ts
// Este archivo centraliza todas las definiciones de tipos de TypeScript
// para el proyecto, creando una fuente única de verdad para las estructuras de datos.

// --- Tipos para la API ---

/**
 * Datos que se envían al backend para crear o actualizar un Cliente.
 */
export type ClientData = {
    full_name: string;
    email?: string | null;
    phone_number?: string | null;
    address?: string | null;
    rfc?: string | null;
};

/**
 * Datos que se envían al backend para crear o actualizar un Caso.
 */
export type CaseData = {
    title: string;
    client_id: number;
    case_number?: string | null;
    description?: string | null;
};


// --- Tipos de Respuesta (Opcional pero recomendado) ---
// Estos tipos representan la estructura completa de los datos tal como los devuelve la API.

/**
 * Representa un objeto Cliente completo, incluyendo los datos que añade el backend.
 */
export type Client = ClientData & {
    id: number;
    workspace_id: number;
    created_at: string; // La API devuelve el datetime como string ISO
};

/**
 * Representa un objeto Caso completo, incluyendo el objeto Cliente anidado.
 */
export type Case = Omit<CaseData, 'client_id'> & {
    id: number;
    assigned_lawyer_id: number;
    workspace_id: number;
    created_at: string;
    status: string; // Podríamos usar un Enum si lo sincronizamos con el backend
    client: Client; // Objeto cliente anidado
};


/**
 * Representa la información básica de un usuario, usada en las actualizaciones.
 */
export type UserBasicInfo = {
    id: number;
    full_name: string;
};

/**
 * Representa un objeto de actualización de caso completo, tal como lo devuelve la API.
 */
export type CaseUpdate = {
    id: number;
    update_text: string;
    visible_to_client: boolean;
    created_at: string; // La API devuelve el datetime como string ISO
    created_by: UserBasicInfo;
    status: "Pendiente" | "En Proceso" | "Completado" | "Cancelado";
};

// La estructura de datos para la página de detalle del caso del cliente
export type ClientCaseDetail = {
    id: number;
    title: string;
    case_number: string | null;
    description: string | null;
    status: string;
    updates: CaseUpdate[];
};

// La estructura para la lista de casos en el dashboard del cliente
export type CaseSummary = {
    id: number;
    title: string;
    case_number: string | null;
    description: string | null;
    status: string;
    client: Client;
};

/**
 * Datos que se envían al backend para crear una nueva actualización.
 */
export type CaseUpdateData = {
    update_text: string;
    visible_to_client: boolean;
    status: "Pendiente" | "En Proceso" | "Completado" | "Cancelado";
};

export type CaseUpdateStatus = {
    status: "Pendiente" | "En Proceso" | "Completado" | "Cancelado";
}

export type LawyerCaseDetail = {
    id: number;
    title: string;
    case_number: string | null;
    description: string | null;
    status: string;
    client: Client;
    updates: CaseUpdate[];
};

export type UpdateStatus = "Pendiente" | "En Proceso" | "Completado" | "Cancelado";

/**
 * Representa un objeto Documento completo, tal como lo devuelve la API.
 */
export type Document = {
    id: number;
    file_name: string;
    file_path: string;
    file_type: string | null;
    uploaded_at: string;
    visible_to_client: boolean;
    uploaded_by: {
        id: number;
        full_name: string;
    };
};

// --- Tipos para la subida de archivos ---
export type InitiateUploadResponse = {
    upload_url: string;
    file_path: string;
    document_id: number;
};

// --- TIPOS PARA EL CALENDARIO ---

/**
 * Representa un objeto de Evento del Calendario completo, tal como lo devuelve la API.
 */
export type CalendarEvent = {
    id: number;
    title: string;
    description: string | null;
    start_time: string; // La API devuelve datetime como string ISO
    end_time: string | null;
    is_all_day: boolean;
    event_type: string; // Podríamos usar un Enum si lo sincronizamos con el frontend
    case_id: number | null;
    location: string | null;
    status: string;
};

/**
 * Datos que se envían al backend para crear un nuevo evento.
 */
export type CalendarEventData = {
    title: string;
    description?: string | null;
    start_time: Date | string;
    end_time?: Date | string | null;
    is_all_day: boolean;
    event_type: string;
    case_id?: number | null;
    location?: string | null;
    status: string;
};

// --- TIPOS PARA INVITACIONES ---

/**
 * Datos que se envían al backend para invitar a un cliente.
 */
export type ClientInviteData = {
    email: string;
    case_title: string;
    client_name: string;
};

/**
 * Datos que devuelve la API al verificar un token de invitación.
 */
export type InvitationDetails = {
    email: string;
    case_title: string;
    client_name: string;
};

/**
 * Datos que envía el cliente al registrarse con un token.
 */
export type AcceptInvitationData = {
    token: string;
    password: string;
    full_name: string;
};

// --- TIPOS PARA FACTURACIÓN ---

export type Invoice = {
    id: number;
    invoice_number: string;
    amount: number;
    balance_due: number;
    status: string;
    issue_date: string;
    due_date: string;
    client_id: number;
};

export type InvoiceData = {
    client_id: number;
    amount: number;
    description: string;
    due_date: string | null;
};

export type PaymentData = {
    amount: number;
    method: string;
    notes: string;
};