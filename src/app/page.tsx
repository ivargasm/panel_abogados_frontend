"use client";

import Link from 'next/link';
import { ShieldCheck, Users, FolderKanban, CalendarClock, Scale } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="bg-background text-foreground">
            {/* Hero Section */}
            <main className="relative isolate overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-accent/5" />
                <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
                        <div className="flex">
                            <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-border/80">
                                <span className="font-semibold text-primary">LexControl v1.0</span>
                                <span className="h-4 w-px bg-border" aria-hidden="true" />
                                <span className="text-muted-foreground">Ahora disponible</span>
                            </div>
                        </div>
                        <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                            La gestión de tu práctica legal, simplificada.
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground">
                            LexControl es la plataforma todo-en-uno diseñada por y para abogados. Centraliza tus casos, clientes y documentos en un entorno seguro y colaborativo.
                        </p>
                        <div className="mt-10 flex items-center gap-x-6">
                            <Link href="/auth/register" className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                                Comienza tu prueba gratuita
                            </Link>
                            <Link href="#features" className="text-sm font-semibold leading-6 text-foreground">
                                Ver características <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
                        {/* Placeholder para una imagen o ilustración atractiva */}
                        <div className="bg-muted rounded-xl shadow-xl w-full h-80 flex items-center justify-center">
                            <Scale size={80} className="text-primary opacity-50" />
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-primary">Todo lo que necesitas</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Una plataforma para dominar tu práctica
                        </p>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground">
                            Desde la gestión de clientes hasta el seguimiento de vencimientos, LexControl te da las herramientas para ser más eficiente.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                            <div className="relative pl-16">
                                <dt className="text-base font-semibold leading-7 text-foreground">
                                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                        <FolderKanban className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    Gestión de Casos Centralizada
                                </dt>
                                <dd className="mt-2 text-base leading-7 text-muted-foreground">Organiza todos tus expedientes, documentos y avances en un solo lugar. Accede a la información crítica de tus casos en segundos.</dd>
                            </div>
                            <div className="relative pl-16">
                                <dt className="text-base font-semibold leading-7 text-foreground">
                                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                        <Users className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    Portal del Cliente Seguro
                                </dt>
                                <dd className="mt-2 text-base leading-7 text-muted-foreground">Ofrece a tus clientes una ventana segura para ver los avances de sus casos, mejorando la comunicación y la confianza.</dd>
                            </div>
                            <div className="relative pl-16">
                                <dt className="text-base font-semibold leading-7 text-foreground">
                                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                        <CalendarClock className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    Calendario y Vencimientos
                                </dt>
                                <dd className="mt-2 text-base leading-7 text-muted-foreground">Nunca más olvides una fecha importante. Registra audiencias y vencimientos, y añádelos a tu calendario personal con un clic.</dd>
                            </div>
                            <div className="relative pl-16">
                                <dt className="text-base font-semibold leading-7 text-foreground">
                                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                        <ShieldCheck className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    Seguridad y Confidencialidad
                                </dt>
                                <dd className="mt-2 text-base leading-7 text-muted-foreground">Construido con la seguridad como prioridad. Tu información y la de tus clientes está protegida y aislada.</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-muted/30">
                <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
                    <p className="text-center text-xs leading-5 text-muted-foreground">
                        &copy; {new Date().getFullYear()} LexControl. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
