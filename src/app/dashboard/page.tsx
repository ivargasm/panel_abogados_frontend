"use client";

import React, { Suspense } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import { DashboardWrapper } from './DashboardWrapper';

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Cargando dashboard...</div>}>
            <ProtectedRoute allowedRoles={['owner', 'lawyer']}>
                <DashboardWrapper />
            </ProtectedRoute>
        </Suspense>
    );
}
