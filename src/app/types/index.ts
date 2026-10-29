// types/index.ts
// Definiciones centralizadas de tipos de TypeScript para LexControl.

export type ClientData = {
    client_type?: "FISICA" | "MORAL";
    full_name: string;
    business_name?: string | null;
    trade_name?: string | null;
    representative_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
    address?: string | null;
    rfc?: string | null;
    notes?: string | null;
    can_view_billing?: boolean;
    assigned_lawyer_id?: number | null;
};

export type CaseData = {
    title: string;
    client_id: number;
    assigned_lawyer_id?: number | null;
    case_number?: string | null;
    judicial_file_number?: string | null;
    legal_matter?: string | null;
    court_name?: string | null;
    client_procedural_role?: string | null;
    opposing_party?: string | null;
    description?: string | null;
    status?: string;
};

export type Client = ClientData & {
    id: number;
    workspace_id: number;
    created_at: string;
    updated_at?: string;
    assigned_lawyer?: LawyerPublicInfo | null;
};

export type LawyerPublicInfo = {
    id: number;
    full_name: string;
    email: string;
    phone_number?: string | null;
    job_title?: string | null;
    professional_license?: string | null;
};

export type UserBasicInfo = {
    id: number;
    full_name: string;
    job_title?: string | null;
    professional_license?: string | null;
};

export type Case = Omit<CaseData, "client_id"> & {
    id: number;
    client_id: number;
    assigned_lawyer_id: number;
    workspace_id: number;
    created_at: string;
    updated_at?: string;
    status: string;
    client: Client;
    assigned_lawyer?: LawyerPublicInfo | null;
};

export type CaseUpdate = {
    id: number;
    update_text: string;
    visible_to_client: boolean;
    created_at: string;
    created_by: UserBasicInfo;
    status: "Pendiente" | "En Proceso" | "Completado" | "Cancelado";
};

export type PortalDocument = {
    id: number;
    file_name: string;
    file_type: string | null;
    file_size_bytes: number;
    uploaded_at: string;
};

export type PortalEvent = {
    id: number;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string | null;
    event_type: string;
    is_fatal_deadline: boolean;
    location: string | null;
    status: string;
};

export type ClientCaseDetail = {
    id: number;
    title: string;
    case_number: string | null;
    judicial_file_number?: string | null;
    legal_matter?: string | null;
    court_name?: string | null;
    client_procedural_role?: string | null;
    opposing_party?: string | null;
    description: string | null;
    status: string;
    created_at?: string | null;
    workspace_name?: string | null;
    can_view_billing: boolean;
    updates: CaseUpdate[];
    documents: PortalDocument[];
    upcoming_events: PortalEvent[];
    assigned_lawyer?: LawyerPublicInfo | null;
};

export type CaseSummary = {
    id: number;
    title: string;
    case_number: string | null;
    judicial_file_number?: string | null;
    legal_matter?: string | null;
    court_name?: string | null;
    client_procedural_role?: string | null;
    opposing_party?: string | null;
    description: string | null;
    status: string;
    created_at?: string;
    client: Client;
    assigned_lawyer?: LawyerPublicInfo | null;
};

export type CaseUpdateData = {
    update_text: string;
    visible_to_client: boolean;
    status: "Pendiente" | "En Proceso" | "Completado" | "Cancelado";
};

export type CaseUpdateStatus = {
    status: "Pendiente" | "En Proceso" | "Completado" | "Cancelado";
};

export type LawyerCaseDetail = Case & {
    updates: CaseUpdate[];
};

export type UpdateStatus = "Pendiente" | "En Proceso" | "Completado" | "Cancelado";

export type Document = {
    id: number;
    file_name: string;
    file_path: string;
    file_type: string | null;
    file_size_bytes?: number;
    uploaded_at: string;
    visible_to_client: boolean;
    uploaded_by: {
        id: number;
        full_name: string;
    };
};

export type InitiateUploadResponse = {
    upload_url: string;
    file_path: string;
    document_id: number;
};

export type CalendarEvent = {
    id: number;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string | null;
    is_all_day: boolean;
    event_type: string;
    is_fatal_deadline: boolean;
    case_id: number | null;
    location: string | null;
    status: string;
};

export type CalendarEventData = {
    title: string;
    description?: string | null;
    start_time: Date | string;
    end_time?: Date | string | null;
    is_all_day: boolean;
    event_type: string;
    is_fatal_deadline?: boolean;
    case_id?: number | null;
    location?: string | null;
    status?: string;
};

export type ClientInviteData = {
    email: string;
    case_title?: string;
    client_name?: string;
};

export type InvitationDetails = {
    email: string;
    case_title: string;
    workspace_name?: string | null;
    client_name: string;
};

export type AcceptInvitationData = {
    token: string;
    password: string;
    full_name: string;
};

export type InvoiceItemType = {
    description: string;
    quantity: number;
    price: number;
};

export type PaymentRecord = {
    id: number;
    amount: number;
    payment_date: string;
    method: string;
    notes?: string | null;
    tracking_key?: string | null;
    issuing_bank?: string | null;
    receipt_file_path?: string | null;
    receipt_file_name?: string | null;
};

export type Invoice = {
    id: number;
    invoice_number: string;
    amount: number;
    balance_due: number;
    status: string;
    issue_date: string;
    due_date: string | null;
    client_id: number;
    case_id?: number | null;
    description?: string | null;
    client?: {
        id: number;
        full_name: string;
        client_type?: string;
        business_name?: string | null;
        rfc?: string | null;
        email?: string | null;
    } | null;
    case?: {
        id: number;
        title: string;
    } | null;
    items?: InvoiceItemType[] | null;
    payments?: PaymentRecord[] | null;
};

export type InvoiceData = {
    client_id: number;
    case_id?: number | null;
    amount: number;
    description: string;
    issue_date?: string | null;
    due_date: string | null;
    items?: InvoiceItemType[];
};

export type PaymentData = {
    amount: number;
    method: string;
    payment_date?: string | null;
    notes?: string | null;
    tracking_key?: string | null;
    issuing_bank?: string | null;
    receipt_file_path?: string | null;
    receipt_file_name?: string | null;
};

export type ParsedReceiptData = {
    amount?: number | null;
    payment_date?: string | null;
    tracking_key?: string | null;
    issuing_bank?: string | null;
    method: string;
    suggested_notes: string;
    confidence: number;
    raw_text_snippet?: string | null;
};

export type ReceiptUploadResponse = {
    receipt_file_path: string;
    receipt_file_name: string;
    download_url?: string | null;
    extracted_data: ParsedReceiptData;
};

export type ParsedCredentialData = {
    license_number?: string | null;
    institution: string;
    degree_title?: string | null;
    holder_name?: string | null;
    credential_type: "CEDULA_PROFESIONAL" | "CARTA_PASANTE";
    confidence: number;
    raw_text_snippet?: string | null;
};

export type CredentialUploadResponse = {
    professional_license_file_path: string;
    professional_license_file_name: string;
    download_url?: string | null;
    extracted_data: ParsedCredentialData;
};

export type PresignedURLResponse = {
    upload_url: string;
    file_path: string;
    document_id: number;
};

export type TeamMember = {
    id: number;
    full_name: string;
    email: string;
    role: "owner" | "lawyer";
    job_title?: string | null;
    phone_number?: string | null;
    professional_license?: string | null;
    professional_license_file_path?: string | null;
    professional_license_file_name?: string | null;
    license_institution?: string | null;
    is_active: boolean;
    assigned_cases_count: number;
    created_at?: string | null;
};

export type ConflictCheckResult = {
    has_conflict: boolean;
    client_matches: {
        client_id: number;
        client_type?: string;
        full_name: string;
        business_name?: string | null;
        representative_name?: string | null;
        rfc?: string | null;
        match_reason?: string | null;
    }[];
    opposing_party_matches: {
        case_id: number;
        case_title: string;
        judicial_file_number?: string | null;
        opposing_party: string;
        client_name?: string | null;
        match_reason?: string | null;
    }[];
};

export type SessionStatusResponse = {
    authenticated: boolean;
    remaining_seconds: number;
    expires_at?: number | null;
    user_email?: string | null;
    role?: string | null;
};

export type TeamInvitation = {
    id: number;
    email: string;
    full_name: string;
    job_title?: string | null;
    phone_number?: string | null;
    professional_license?: string | null;
    token?: string | null;
    status: "sent" | "accepted" | "cancelled" | "expired";
    expires_at: string;
    created_at: string;
};

export type TeamInviteData = {
    full_name: string;
    email: string;
    job_title?: string;
    phone_number?: string;
    professional_license?: string;
    professional_license_file_path?: string;
    professional_license_file_name?: string;
    license_institution?: string;
};

export type TeamInviteValidation = {
    valid: boolean;
    email: string;
    full_name: string;
    job_title?: string | null;
    professional_license?: string | null;
    workspace_name: string;
    is_existing_user?: boolean;
};
