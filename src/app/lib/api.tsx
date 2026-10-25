// lib/api.tsx
// Cliente centralizado de comunicación con la API de FastAPI.

import type {
    ClientData,
    CaseData,
    CaseUpdateData,
    InitiateUploadResponse,
    Document,
    CalendarEventData,
    ClientInviteData,
    AcceptInvitationData,
    InvitationDetails,
    ClientCaseDetail,
    CaseSummary,
    CaseUpdateStatus,
    Invoice,
    InvoiceData,
    PaymentData,
    PresignedURLResponse,
    TeamMember,
    ConflictCheckResult,
    SessionStatusResponse,
    TeamInvitation,
    TeamInviteData,
    TeamInviteValidation,
    ReceiptUploadResponse,
    CredentialUploadResponse,
} from "@/app/types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
    try {
        const data = await res.json();
        if (typeof data?.detail === "string") return data.detail;
        if (Array.isArray(data?.detail) && data.detail.length > 0) {
            return data.detail.map((d: { msg?: string }) => d.msg || "").filter(Boolean).join(", ") || fallback;
        }
    } catch {
        // Ignorar si no es JSON
    }
    return fallback;
}

// --- API de Autenticación ---

export const fetchUser = async (url: string = API_URL) => {
    const res = await fetch(`${url}/auth/me`, { credentials: "include" });
    if (!res.ok) throw new Error("No autenticado");
    return res.json();
};

export const getSessionStatus = async (url: string = API_URL): Promise<SessionStatusResponse> => {
    try {
        const res = await fetch(`${url}/auth/session-status`, { credentials: "include" });
        if (!res.ok) return { authenticated: false, remaining_seconds: 0 };
        return res.json();
    } catch {
        return { authenticated: false, remaining_seconds: 0 };
    }
};

export const refreshSession = async (url: string = API_URL): Promise<{ message: string; expires_in: number }> => {
    const res = await fetch(`${url}/auth/refresh`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "No se pudo renovar la sesión."));
    }
    return res.json();
};

export const login = async (email: string, password: string, url: string = API_URL) => {
    const res = await fetch(`${url}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const msg = await extractErrorMessage(res, "Credenciales incorrectas");
        throw new Error(msg);
    }
    return res;
};

export const logout = async (url: string = API_URL) => {
    const res = await fetch(`${url}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Error al cerrar sesión");
    return res;
};

export async function register(
    username: string,
    email: string,
    password: string,
    url: string = API_URL,
    extras?: { workspace_name?: string; professional_license?: string }
) {
    const res = await fetch(`${url}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            full_name: username,
            email,
            password,
            workspace_name: extras?.workspace_name,
            professional_license: extras?.professional_license,
        }),
    });

    if (!res.ok) {
        const msg = await extractErrorMessage(res, "No se pudo completar el registro");
        throw new Error(msg);
    }

    return res.json();
}

export async function forgot_password(url: string = API_URL, email: string) {
    const res = await fetch(`${url}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al enviar el correo"));
    return res;
}

export async function reset_password(url: string = API_URL, new_password: string, token: string) {
    const res = await fetch(`${url}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password }),
    });

    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al restablecer la contraseña"));
    return res;
}

export async function updateUserProfile(
    profileData: {
        full_name?: string;
        phone_number?: string;
        job_title?: string;
        professional_license?: string;
        profile_picture_url?: string;
    },
    url: string = API_URL
) {
    const res = await fetch(`${url}/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al actualizar el perfil"));
    return res.json();
}

export async function changePassword(
    passwordData: { current_password: string; new_password: string },
    url: string = API_URL
) {
    const res = await fetch(`${url}/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(passwordData),
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al cambiar la contraseña"));
    }
    return res.json();
}

export async function initiateProfilePictureUpload(
    fileName: string,
    fileType: string,
    fileSize: number,
    url: string = API_URL
): Promise<PresignedURLResponse> {
    const res = await fetch(`${url}/auth/profile-picture/initiate-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ file_name: fileName, file_type: fileType, file_size_bytes: fileSize }),
    });
    if (!res.ok) throw new Error("No se pudo iniciar la subida de la foto de perfil");
    return res.json();
}

// --- API para Equipo / Colaboradores y Despacho ---

export async function getTeamMembers(includeInactive = false, url: string = API_URL): Promise<TeamMember[]> {
    const res = await fetch(`${url}/api/team?include_inactive=${includeInactive}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al obtener los integrantes del despacho"));
    return res.json();
}

export async function createTeamMember(
    memberData: {
        full_name: string;
        email: string;
        password: string;
        job_title?: string;
        phone_number?: string;
        professional_license?: string;
    },
    url: string = API_URL
): Promise<TeamMember> {
    const res = await fetch(`${url}/api/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(memberData),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al registrar al colaborador"));
    return res.json();
}

export async function updateTeamMember(
    memberId: number,
    updateData: {
        full_name?: string;
        job_title?: string;
        phone_number?: string;
        professional_license?: string;
        professional_license_file_path?: string;
        professional_license_file_name?: string;
        license_institution?: string;
        is_active?: boolean;
        new_password?: string;
    },
    url: string = API_URL
): Promise<TeamMember> {
    const res = await fetch(`${url}/api/team/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al actualizar al colaborador"));
    return res.json();
}

export async function deactivateTeamMember(memberId: number, url: string = API_URL) {
    const res = await fetch(`${url}/api/team/${memberId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok && res.status !== 204) {
        throw new Error(await extractErrorMessage(res, "Error al dar de baja al colaborador"));
    }
    return res;
}

export async function updateWorkspaceName(name: string, url: string = API_URL): Promise<{ id: number; name: string }> {
    const res = await fetch(`${url}/api/team/workspace`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al actualizar el nombre del despacho"));
    return res.json();
}

export async function inviteTeamMember(
    data: TeamInviteData,
    url: string = API_URL
): Promise<TeamInvitation> {
    const res = await fetch(`${url}/api/team/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al enviar la invitación al colaborador"));
    return res.json();
}

export async function getTeamInvitations(url: string = API_URL): Promise<TeamInvitation[]> {
    const res = await fetch(`${url}/api/team/invitations`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al obtener las invitaciones pendientes"));
    return res.json();
}

export async function resendTeamInvitation(invitationId: number, url: string = API_URL): Promise<TeamInvitation> {
    const res = await fetch(`${url}/api/team/invitations/${invitationId}/resend`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al reenviar la invitación"));
    return res.json();
}

export async function cancelTeamInvitation(invitationId: number, url: string = API_URL) {
    const res = await fetch(`${url}/api/team/invitations/${invitationId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok && res.status !== 204) {
        throw new Error(await extractErrorMessage(res, "Error al cancelar la invitación"));
    }
    return res;
}

export async function validateTeamInvitation(token: string, url: string = API_URL): Promise<TeamInviteValidation> {
    const res = await fetch(`${url}/api/team/invitations/validate/${encodeURIComponent(token)}`);
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Enlace de invitación inválido o expirado"));
    return res.json();
}

export async function acceptTeamInvitation(
    token: string,
    password: string,
    url: string = API_URL
): Promise<{ message: string; access_token: string; user?: unknown }> {
    const res = await fetch(`${url}/api/team/invitations/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, password }),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al activar la cuenta de colaborador"));
    return res.json();
}

export async function uploadAndParseCredential(file: File, url: string = API_URL): Promise<CredentialUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${url}/api/team/credentials/upload-and-parse`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al procesar la Cédula Profesional"));
    }
    return res.json();
}

export async function getMemberCredentialUrl(memberId: number, url: string = API_URL): Promise<{ download_url: string; file_name: string }> {
    const res = await fetch(`${url}/api/team/members/${memberId}/credential`, {
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al obtener el enlace de la cédula"));
    }
    return res.json();
}

export async function checkConflictOfInterest(
    name: string,
    options?: { rfc?: string; excludeClientId?: number; excludeCaseId?: number },
    url: string = API_URL
): Promise<ConflictCheckResult> {
    const params = new URLSearchParams({ name });
    if (options?.rfc) params.set("rfc", options.rfc);
    if (options?.excludeClientId) params.set("exclude_client_id", String(options.excludeClientId));
    if (options?.excludeCaseId) params.set("exclude_case_id", String(options.excludeCaseId));

    const res = await fetch(`${url}/api/conflict-check?${params.toString()}`, {
        credentials: "include",
    });
    if (!res.ok) return { has_conflict: false, client_matches: [], opposing_party_matches: [] };
    return res.json();
}

// --- API para Clientes (CRUD Completo) ---

export async function getClients(url: string = API_URL) {
    const res = await fetch(`${url}/api/clients/`, { credentials: "include" });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al obtener los clientes"));
    return res.json();
}

export async function createClient(clientData: unknown, url: string = API_URL) {
    const res = await fetch(`${url}/api/clients/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(clientData),
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al crear el cliente"));
    }
    return res.json();
}

export async function updateClient(clientId: number, clientData: ClientData, url: string = API_URL) {
    const res = await fetch(`${url}/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(clientData),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al actualizar el cliente"));
    return res.json();
}

export async function deleteClient(clientId: number, url: string = API_URL) {
    const res = await fetch(`${url}/api/clients/${clientId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok && res.status !== 204) {
        throw new Error(await extractErrorMessage(res, "Error al eliminar el cliente"));
    }
    return res;
}

// --- API para Casos ---

export async function getCases(url: string = API_URL, clientId: number | null = null) {
    const queryParams = clientId ? `?client_id=${clientId}` : "";
    const res = await fetch(`${url}/api/cases/${queryParams}`, { credentials: "include" });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al obtener los expedientes"));
    return res.json();
}

export async function createCase(caseData: CaseData, url: string = API_URL) {
    const res = await fetch(`${url}/api/cases/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(caseData),
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al crear el expediente"));
    }
    return res.json();
}

export async function updateCase(caseId: number, caseData: CaseData, url: string = API_URL) {
    const res = await fetch(`${url}/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(caseData),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al actualizar el expediente"));
    return res.json();
}

export async function updateCaseStatus(caseId: number, status: string, url: string = API_URL) {
    const res = await fetch(`${url}/api/cases/${caseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al actualizar la etapa procesal"));
    return res.json();
}

export async function deleteCase(caseId: number, url: string = API_URL) {
    const res = await fetch(`${url}/api/cases/${caseId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok && res.status !== 204) {
        throw new Error(await extractErrorMessage(res, "Error al archivar el expediente"));
    }
    return res;
}

// --- Detalle y Actuaciones de Expediente ---

export async function getCaseById(caseId: number, url: string = API_URL) {
    const res = await fetch(`${url}/api/cases/${caseId}`, { credentials: "include" });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al obtener los detalles del expediente"));
    return res.json();
}

export async function getCaseUpdates(caseId: number, url: string = API_URL) {
    const res = await fetch(`${url}/api/cases/${caseId}/updates`, { credentials: "include" });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al obtener las actuaciones del expediente"));
    return res.json();
}

export async function createCaseUpdate(caseId: number, updateData: CaseUpdateData, url: string = API_URL) {
    const res = await fetch(`${url}/api/cases/${caseId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al registrar la actuación"));
    return res.json();
}

export async function updateCaseUpdateStatus(updateId: number, newStatus: CaseUpdateStatus, url: string = API_URL) {
    const res = await fetch(`${url}/api/case-updates/${updateId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newStatus),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al cambiar el estado de la actuación"));
    return res.json();
}

export async function updateCaseUpdate(updateId: number, updateData: CaseUpdateData, url: string = API_URL) {
    const res = await fetch(`${url}/api/case-updates/${updateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al actualizar la actuación"));
    return res.json();
}

export async function deleteCaseUpdate(updateId: number, url: string = API_URL) {
    const res = await fetch(`${url}/api/case-updates/${updateId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok && res.status !== 204) {
        throw new Error(await extractErrorMessage(res, "Error al eliminar la actuación"));
    }
    return res;
}

// --- API para Documentos ---

export async function getDocumentsForCase(caseId: number, url: string = API_URL): Promise<Document[]> {
    const res = await fetch(`${url}/api/cases/${caseId}/documents`, { credentials: "include" });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al obtener los documentos del expediente"));
    return res.json();
}

export async function initiateUpload(
    caseId: number,
    fileName: string,
    fileType: string,
    fileSize: number,
    url: string = API_URL,
    visibleToClient = false
): Promise<InitiateUploadResponse> {
    const res = await fetch(`${url}/api/cases/${caseId}/documents/initiate-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            file_name: fileName,
            file_type: fileType,
            file_size_bytes: fileSize,
            visible_to_client: visibleToClient,
        }),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "No se pudo iniciar la subida del documento"));
    return res.json();
}

export async function uploadFileToS3(uploadUrl: string, file: File) {
    const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: file.type ? { "Content-Type": file.type } : undefined,
    });
    if (!res.ok) throw new Error("Error al transferir el archivo al almacenamiento");
    return res;
}

export async function getDownloadUrl(documentId: number, url: string = API_URL): Promise<{ download_url: string }> {
    const res = await fetch(`${url}/api/documents/${documentId}/download-url`, { credentials: "include" });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "No se pudo obtener el enlace de descarga"));
    return res.json();
}

export async function toggleDocumentVisibility(
    documentId: number,
    visibleToClient: boolean,
    url: string = API_URL
): Promise<Document> {
    const res = await fetch(`${url}/api/documents/${documentId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visible_to_client: visibleToClient }),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "No se pudo actualizar la visibilidad del documento"));
    return res.json();
}

export async function deleteDocument(documentId: number, url: string = API_URL) {
    const res = await fetch(`${url}/api/documents/${documentId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok && res.status !== 204) {
        throw new Error(await extractErrorMessage(res, "No se pudo eliminar el documento"));
    }
    return res;
}

// --- API para Calendario ---

export async function getCalendarEvents(
    start: string,
    end: string,
    url: string = API_URL,
    caseId: number | null = null
) {
    const params = new URLSearchParams({ start, end });
    if (caseId) {
        params.append("case_id", String(caseId));
    }

    const res = await fetch(`${url}/api/calendar-events/?${params}`, { credentials: "include" });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al obtener los eventos de la agenda"));
    return res.json();
}

export async function createCalendarEvent(eventData: CalendarEventData, url: string = API_URL) {
    const res = await fetch(`${url}/api/calendar-events/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al crear el evento"));
    return res.json();
}

export async function updateCalendarEvent(eventId: number, eventData: Partial<CalendarEventData>, url: string = API_URL) {
    const res = await fetch(`${url}/api/calendar-events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al actualizar el evento"));
    return res.json();
}

export async function deleteCalendarEvent(eventId: number, url: string = API_URL) {
    const res = await fetch(`${url}/api/calendar-events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok && res.status !== 204) {
        throw new Error(await extractErrorMessage(res, "Error al eliminar el evento"));
    }
    return res;
}

export async function downloadCalendarEventIcs(eventId: number, url: string = API_URL) {
    const res = await fetch(`${url}/api/calendar-events/${eventId}/download`, {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("No se pudo exportar el evento en formato iCalendar (.ics)");
    }

    const disposition = res.headers.get("Content-Disposition");
    let filename = "evento_juridico.ics";
    if (disposition && disposition.includes("attachment")) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches?.[1]) {
            filename = matches[1].replace(/['"]/g, "");
        }
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
}

// --- API para Invitaciones de Clientes ---

export async function inviteClient(clientId: number, _inviteData?: ClientInviteData, url: string = API_URL) {
    const res = await fetch(`${url}/api/clients/${clientId}/invite`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al enviar la invitación"));
    }
    return res.json();
}

export async function getInvitationDetails(token: string, url: string = API_URL): Promise<InvitationDetails> {
    const res = await fetch(`${url}/api/invitations/${token}`);
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Invitación no válida o expirada"));
    }
    return res.json();
}

export async function acceptInvitation(data: AcceptInvitationData, url: string = API_URL) {
    const res = await fetch(`${url}/api/invitations/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "No se pudo activar la cuenta"));
    }
    return res.json();
}

// --- API para Portal del Cliente ---

export async function getMyCases(url: string = API_URL): Promise<CaseSummary[]> {
    const res = await fetch(`${url}/api/portal/my-cases`, { credentials: "include" });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al obtener tus expedientes"));
    return res.json();
}

export async function getMyCaseDetails(caseId: string, url: string = API_URL): Promise<ClientCaseDetail> {
    const res = await fetch(`${url}/api/portal/my-cases/${caseId}`, { credentials: "include" });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Expediente no encontrado o sin permiso de acceso."));
    }
    return res.json();
}

export async function getPortalCaseBilling(caseId: string | number, url: string = API_URL): Promise<Invoice[]> {
    const res = await fetch(`${url}/api/portal/my-cases/${caseId}/billing`, { credentials: "include" });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "No se pudo consultar el estado de cuenta."));
    }
    return res.json();
}

export async function getPortalDocumentDownloadUrl(
    caseId: string | number,
    documentId: number,
    url: string = API_URL
): Promise<{ download_url: string; file_name?: string }> {
    const res = await fetch(`${url}/api/portal/my-cases/${caseId}/documents/${documentId}/download-url`, {
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "No se pudo descargar el documento."));
    }
    return res.json();
}

// --- Suscripciones ---

export async function createCheckoutSession(url: string = API_URL): Promise<{ checkout_url: string }> {
    const res = await fetch(`${url}/api/subscriptions/create-checkout-session`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "No se pudo iniciar la sesión de suscripción."));
    }
    return res.json();
}

export async function createCustomerPortalSession(url: string = API_URL): Promise<{ portal_url: string }> {
    const res = await fetch(`${url}/api/subscriptions/create-customer-portal-session`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "No se pudo abrir el portal de suscripción."));
    }
    return res.json();
}

// --- API para Facturación y Cobranza ---

export async function getBillingStats(url: string = API_URL) {
    const res = await fetch(`${url}/api/billing/stats`, { credentials: "include" });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al obtener las métricas de cobranza"));
    return res.json();
}

export async function getInvoices(url: string = API_URL): Promise<Invoice[]> {
    const res = await fetch(`${url}/api/billing/invoices`, { credentials: "include" });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al obtener los estados de cuenta"));
    return res.json();
}

export async function createInvoice(invoiceData: InvoiceData, url: string = API_URL) {
    const res = await fetch(`${url}/api/billing/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(invoiceData),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Error al registrar el estado de cuenta"));
    return res.json();
}

export async function recordPayment(invoiceId: number, paymentData: PaymentData, url: string = API_URL) {
    const res = await fetch(`${url}/api/billing/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(paymentData),
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al registrar el abono"));
    }
    return res.json();
}

export async function uploadAndParseReceipt(file: File, url: string = API_URL): Promise<ReceiptUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${url}/api/billing/receipts/upload-and-parse`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al procesar el comprobante bancario"));
    }
    return res.json();
}

export async function getPaymentReceiptUrl(paymentId: number, url: string = API_URL): Promise<{ download_url: string; receipt_file_name: string }> {
    const res = await fetch(`${url}/api/billing/payments/${paymentId}/receipt`, {
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al obtener el enlace del comprobante"));
    }
    return res.json();
}

export async function deleteInvoice(invoiceId: number, url: string = API_URL) {
    const res = await fetch(`${url}/api/billing/invoices/${invoiceId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok && res.status !== 204) {
        throw new Error(await extractErrorMessage(res, "Error al eliminar el estado de cuenta"));
    }
    return res;
}

export async function reassignInvoice(invoiceId: number, caseId: number | null, url: string = API_URL) {
    const res = await fetch(`${url}/api/billing/invoices/${invoiceId}/reassign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ case_id: caseId }),
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al vincular el estado de cuenta"));
    }
    return res.json();
}

// --- API de Dashboard ---

export async function getDashboardStats(url: string = API_URL) {
    const res = await fetch(`${url}/api/dashboard/stats`, {
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al obtener estadísticas del despacho"));
    }
    return res.json();
}

export async function getRecentActivity(url: string = API_URL, limit: number = 10) {
    const res = await fetch(`${url}/api/dashboard/recent-activity?limit=${limit}`, {
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al obtener actividad reciente"));
    }
    return res.json();
}

export async function getUpcomingDeadlines(url: string = API_URL, daysAhead: number = 30) {
    const res = await fetch(`${url}/api/dashboard/upcoming-deadlines?days_ahead=${daysAhead}`, {
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(await extractErrorMessage(res, "Error al obtener términos próximos"));
    }
    return res.json();
}
