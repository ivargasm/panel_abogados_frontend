// lib/api.ts
// Este archivo centraliza todas las llamadas a la API de FastAPI.
// Ahora importa los tipos desde un archivo centralizado para mayor orden y mantenibilidad.

import type { ClientData, CaseData, CaseUpdateData, InitiateUploadResponse, Document, CalendarEventData, ClientInviteData, AcceptInvitationData, InvitationDetails, ClientCaseDetail, CaseSummary, CaseUpdateStatus, Invoice, InvoiceData, PaymentData, PresignedURLResponse } from "@/app/types"; // Importamos los tipos

// --- API de Autenticación ---

export const fetchUser = async (url: string) => {
    const res = await fetch(`${url}/auth/me`, { credentials: 'include' });
    if (!res.ok) throw new Error("Login failed");;
    return res.json();
};


export const login = async (email: string, password: string, url: string) => {
    const res = await fetch(`${url}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Credenciales incorrectas');
    return res;
};

export const logout = async (url: string) => {
    const res = await fetch(`${url}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al cerrar sesión');
    return res;
};

export async function register(username: string, email: string, password: string, url: string) {
    try {
        const res = await fetch(`${url}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        return res.json();
    } catch (error) {
        console.error("Error en el registro:", error);
        return false;
    }
}

export async function forgot_password(url: string, email: string) {
    const res = await fetch(`${url}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    if (!res.ok) throw new Error('Error al enviar el correo');
    return res;
}

export async function reset_password(url: string, new_password: string, token: string) {
    const res = await fetch(`${url}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password }),
    });

    if (!res.ok) throw new Error('Error al resetear la contraseña');
    return res;
}

export async function updateUserProfile(profileData: { full_name?: string; phone_number?: string; job_title?: string; profile_picture_url?: string }, url: string) {
    const res = await fetch(`${url}/auth/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error('Error al actualizar el perfil');
    return res.json();
}

export async function changePassword(passwordData: { current_password: string; new_password: string }, url: string) {
    const res = await fetch(`${url}/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passwordData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Error al cambiar la contraseña');
    }
    return res.json();
}

export async function initiateProfilePictureUpload(fileName: string, fileType: string, fileSize: number, url: string): Promise<PresignedURLResponse> {
    const res = await fetch(`${url}/auth/profile-picture/initiate-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ file_name: fileName, file_type: fileType, file_size_bytes: fileSize }),
    });
    if (!res.ok) throw new Error('No se pudo iniciar la subida de la foto de perfil');
    return res.json();
}

// --- API para Clientes (CRUD Completo) ---

export async function getClients(url: string) {
    const res = await fetch(`${url}/api/clients/`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener los clientes');
    return res.json();
}

export async function createClient(clientData: unknown, url: string) {
    const res = await fetch(`${url}/api/clients/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(clientData),
    });
    if (!res.ok && res.status === 409) throw new Error('Error al crear el cliente: Ya existe un cliente con ese correo electrónico');
    return res.json();
}

export async function updateClient(clientId: number, clientData: ClientData, url: string) {
    const res = await fetch(`${url}/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(clientData),
    });
    if (!res.ok) throw new Error('Error al actualizar el cliente');
    return res.json();
}

export async function deleteClient(clientId: number, url: string) {
    const res = await fetch(`${url}/api/clients/${clientId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok && res.status !== 204 && res.status === 409) {
        throw new Error('Error al eliminar el cliente: El cliente tiene casos asociados');
    }
    return res;
}

// --- API para Casos ---

export async function getCases(url: string, clientId: number | null) {
    const queryParams = clientId ? `?client_id=${clientId}` : '';
    const res = await fetch(`${url}/api/cases/${queryParams}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener los casos');
    return res.json();
}

export async function createCase(caseData: CaseData, url: string) {
    const res = await fetch(`${url}/api/cases/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(caseData),
    });
    // crear diferentes errores 409, 403 con el mensaje que llega del backend
    if (!res.ok && res.status === 409) throw new Error(`Error al crear el caso: ${await res.text()}`);
    if (!res.ok && res.status === 403) throw new Error(`Error al crear el caso: ${await res.text()}`);
    return res.json();
}

export async function updateCase(caseId: number, caseData: CaseData, url: string) {
    const res = await fetch(`${url}/api/cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(caseData),
    });
    if (!res.ok) throw new Error('Error al actualizar el caso');
    return res.json();
}

export async function deleteCase(caseId: number, url: string) {
    const res = await fetch(`${url}/api/cases/${caseId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok && res.status !== 204) {
        throw new Error('Error al eliminar el caso');
    }
    return res;
}

// --- FUNCIONES ADICIONALES PARA DETALLE DE CASO ---

export async function getCaseById(caseId: number, url: string) {
    const res = await fetch(`${url}/api/cases/${caseId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener los detalles del caso');
    return res.json();
}

export async function getCaseUpdates(caseId: number, url: string) {
    const res = await fetch(`${url}/api/cases/${caseId}/updates`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener las actualizaciones del caso');
    return res.json();
}

export async function createCaseUpdate(caseId: number, updateData: CaseUpdateData, url: string) {
    const res = await fetch(`${url}/api/cases/${caseId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error('Error al crear la actualización');
    return res.json();
}

export async function updateCaseUpdateStatus(updateId: number, newStatus: CaseUpdateStatus, url: string) {
    const res = await fetch(`${url}/api/cases/${updateId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newStatus),
    });
    if (!res.ok) throw new Error('Error al actualizar la actualización');
    return res.json();
}

export async function updateCaseUpdate(updateId: number, updateData: CaseUpdateData, url: string) {
    const res = await fetch(`${url}/api/cases/${updateId}/updates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error('Error al actualizar la actualización');
    return res.json();
}

// --- API para Documentos ---

export async function getDocumentsForCase(caseId: number, url: string): Promise<Document[]> {
    const res = await fetch(`${url}/api/cases/${caseId}/documents`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener los documentos del caso');
    return res.json();
}

export async function initiateUpload(caseId: number, fileName: string, fileType: string, fileSize: number, url: string): Promise<InitiateUploadResponse> {
    const res = await fetch(`${url}/api/cases/${caseId}/documents/initiate-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ file_name: fileName, file_type: fileType, file_size_bytes: fileSize }),
    });
    if (!res.ok) throw new Error('No se pudo iniciar la subida del archivo');
    return res.json();
}

export async function uploadFileToS3(uploadUrl: string, file: File) {
    const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    });
    if (!res.ok) throw new Error('Error al subir el archivo a S3');
    return res;
}

export async function getDownloadUrl(documentId: number, url: string): Promise<{ download_url: string }> {
    const res = await fetch(`${url}/api/documents/${documentId}/download-url`, { credentials: 'include' });
    if (!res.ok) throw new Error('No se pudo obtener el enlace de descarga');
    return res.json();
}

// --- API para Calendario ---

export async function getCalendarEvents(start: string, end: string, url: string, caseId: number | null) {
    // Construimos la URL con los query parameters que espera el backend
    const params = new URLSearchParams({ start, end });

    // Si se seleccionó un caso, lo añadimos como parámetro
    if (caseId) {
        params.append('case_id', String(caseId));
    }

    const res = await fetch(`${url}/api/calendar-events/?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener los eventos del calendario');
    return res.json();
}

export async function createCalendarEvent(eventData: CalendarEventData, url: string) {
    const res = await fetch(`${url}/api/calendar-events/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error('Error al crear el evento');
    return res.json();
}

export async function updateCalendarEvent(eventId: number, eventData: Partial<CalendarEventData>, url: string) {
    const res = await fetch(`${url}/api/calendar-events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error('Error al actualizar el evento');
    return res.json();
}

export async function deleteCalendarEvent(eventId: number, url: string) {
    const res = await fetch(`${url}/api/calendar-events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok && res.status !== 204) {
        throw new Error('Error al eliminar el evento');
    }
    return res;
}

export async function downloadCalendarEventIcs(eventId: number, url: string) {
    const res = await fetch(`${url}/api/calendar-events/${eventId}/download`, {
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('No se pudo descargar el evento del calendario');
    }

    // Obtener el nombre del archivo del header 'Content-Disposition'
    const disposition = res.headers.get('Content-Disposition');
    let filename = 'evento.ics'; // Nombre por defecto
    if (disposition && disposition.includes('attachment')) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches?.[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    }

    // Crear un enlace temporal para iniciar la descarga del archivo
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    // Limpiar el enlace temporal
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
}

// --- API para Invitaciones de Clientes ---

export async function inviteClient(caseId: number, inviteData: ClientInviteData, url: string) {
    const res = await fetch(`${url}/api/cases/${caseId}/invite-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(inviteData),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Error al enviar la invitación');
    }
    return res.json();
}

export async function getInvitationDetails(token: string, url: string): Promise<InvitationDetails> {
    const res = await fetch(`${url}/api/invitations/${token}`);
    if (!res.ok) {
        throw new Error('Invitación no válida o expirada');
    }
    return res.json();
}

export async function acceptInvitation(data: AcceptInvitationData, url: string) {
    const res = await fetch(`${url}/api/invitations/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'No se pudo crear la cuenta');
    }
    return res.json();
}

// --- API para Portal del Cliente ---

export async function getMyCases(url: string): Promise<CaseSummary[]> {
    // El backend ya sabe qué cliente es por la cookie de sesión.
    const res = await fetch(`${url}/api/portal/my-cases`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener tus casos');
    return res.json();
}

export async function getMyCaseDetails(caseId: string, url: string): Promise<ClientCaseDetail> {
    const res = await fetch(`${url}/api/portal/my-cases/${caseId}`, { credentials: 'include' });
    if (!res.ok) {
        if (res.status === 404) {
            throw new Error('Caso no encontrado o no tienes permiso para verlo.');
        }
        throw new Error('Error al obtener los detalles del caso');
    }
    return res.json();
}

/**
 * Llama al backend para crear una sesión de checkout de Stripe.
 * Devuelve la URL a la que se debe redirigir al usuario para pagar.
 */
export async function createCheckoutSession(url: string): Promise<{ checkout_url: string }> {
    const res = await fetch(`${url}/api/subscriptions/create-checkout-session`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) {
        throw new Error('No se pudo iniciar la sesión de pago.');
    }
    return res.json();
}

/**
 * Llama al backend para crear una sesión del portal de cliente de Stripe.
 * Devuelve la URL a la que se debe redirigir al usuario para gestionar su suscripción.
 */
export async function createCustomerPortalSession(url: string): Promise<{ portal_url: string }> {
    const res = await fetch(`${url}/api/subscriptions/create-customer-portal-session`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) {
        throw new Error('No se pudo abrir el portal de gestión.');
    }
    return res.json();
}

// --- API para Facturación ---

export async function getBillingStats(url: string) {
    const res = await fetch(`${url}/api/billing/stats`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener las estadísticas de facturación');
    return res.json();
}

export async function getInvoices(url: string): Promise<Invoice[]> {
    const res = await fetch(`${url}/api/billing/invoices/`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener las facturas');
    return res.json();
}

export async function createInvoice(invoiceData: InvoiceData, url: string) {
    const res = await fetch(`${url}/api/billing/invoices/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(invoiceData),
    });
    if (!res.ok) throw new Error('Error al crear la factura');
    return res.json();
}

export async function recordPayment(invoiceId: number, paymentData: PaymentData, url: string) {
    const res = await fetch(`${url}/api/billing/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(paymentData),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Error al registrar el pago');
    }
    return res.json();
}
// --- API de Dashboard ---

export async function getDashboardStats(url: string) {
    const res = await fetch(`${url}/api/dashboard/stats`, {
        credentials: 'include',
    });
    if (!res.ok) {
        throw new Error('Error al obtener estadísticas del dashboard');
    }
    return res.json();
}

export async function getRecentActivity(url: string, limit: number = 10) {
    const res = await fetch(`${url}/api/dashboard/recent-activity/?limit=${limit}`, {
        credentials: 'include',
    });
    if (!res.ok) {
        throw new Error('Error al obtener actividad reciente');
    }
    return res.json();
}

export async function getUpcomingDeadlines(url: string, daysAhead: number = 30) {
    const res = await fetch(`${url}/api/dashboard/upcoming-deadlines/?days_ahead=${daysAhead}`, {
        credentials: 'include',
    });
    if (!res.ok) {
        throw new Error('Error al obtener vencimientos próximos');
    }
    return res.json();
}
