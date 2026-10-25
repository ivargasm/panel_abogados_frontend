"use client";

import React from "react";
import ProtectedRoute from "@/app/components/ProtectedRoutes";
import SessionExpiryWatcher from "@/app/components/SessionExpiryWatcher";

export default function PortalClienteLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["client"]}>
            <SessionExpiryWatcher />
            {children}
        </ProtectedRoute>
    );
}
