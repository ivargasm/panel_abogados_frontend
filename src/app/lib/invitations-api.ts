// --- API de Invitaciones (Client-based) ---
import { API_URL } from "./api";

export async function inviteClient(clientId: number) {
    const response = await fetch(`${API_URL}/api/clients/${clientId}/invite`, {
        method: "POST",
        credentials: "include",
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "No se pudo enviar la invitación al cliente");
    }
    return response.json();
}

export async function resendClientInvitation(clientId: number) {
    const response = await fetch(`${API_URL}/api/clients/${clientId}/resend-invite`, {
        method: "POST",
        credentials: "include",
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "No se pudo reenviar la invitación");
    }
    return response.json();
}

export async function cancelInvitation(invitationId: number) {
    const response = await fetch(`${API_URL}/api/invitations/${invitationId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "No se pudo cancelar la invitación");
    }
    return response.json();
}

export async function getClientInvitationStatus(clientId: number) {
    const response = await fetch(`${API_URL}/api/clients/${clientId}/invitation-status`, {
        credentials: "include",
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "No se pudo consultar el estado de la invitación");
    }
    return response.json();
}
