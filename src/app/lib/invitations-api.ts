// --- API de Invitaciones (Client-based) ---

export async function inviteClient(clientId: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients/${clientId}/invite`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to invite client');
    }
    return response.json();
}

export async function resendClientInvitation(clientId: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients/${clientId}/resend-invite`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to resend invitation');
    }
    return response.json();
}

export async function cancelInvitation(invitationId: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitations/${invitationId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to cancel invitation');
    }
    return response.json();
}

export async function getClientInvitationStatus(clientId: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients/${clientId}/invitation-status`, {
        credentials: 'include',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get invitation status');
    }
    return response.json();
}
