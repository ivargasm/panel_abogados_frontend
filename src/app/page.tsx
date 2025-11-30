"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Workflow, MessageSquare, FileText, Check } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center lg:gap-y-10">
                        <div className="lg:pr-8">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                                Optimiza tu Práctica Legal con LexControl
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Gestión de Casos, Administración de Clientes, Control de Facturación y mucho más. Todo en una plataforma segura diseñada específicamente para abogados y despachos jurídicos.
                            </p>
                            <div className="mt-10 flex items-center gap-x-6">
                                <Link
                                    href="/auth/register"
                                    className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    Solicitar Demo
                                </Link>
                                <Link href="#features" className="text-base font-semibold leading-7 text-gray-900">
                                    Explorar Características <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                        <div className="relative lg:row-span-2">
                            <Image
                                src="/hero-legal-desk.png"
                                alt="Escritorio legal profesional"
                                width={600}
                                height={400}
                                className="rounded-2xl shadow-xl ring-1 ring-gray-400/10"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="bg-[#1E4D3D] py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <p className="text-center text-sm font-semibold leading-8 text-white/80 uppercase tracking-wide">
                        Confiado por despachos líderes y profesionales del derecho
                    </p>
                    <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                        {['SOCIOS LEGALES', 'JURÍDICO', 'ABOGADOS', 'JUSTICIA', 'BUFETE'].map((name) => (
                            <div key={name} className="col-span-2 flex justify-center lg:col-span-1">
                                <div className="h-16 w-full bg-white/10 rounded-lg flex items-center justify-center">
                                    <span className="text-white/60 font-semibold text-xs">{name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-primary">Todo lo que necesitas</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Todo para gestionar tu despacho
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            LexControl está diseñado con potentes características para ayudarte a ahorrar tiempo, mejorar la colaboración y enfocarte en lo que realmente importa: tus clientes.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            <div className="flex flex-col bg-gray-50 p-8 rounded-2xl">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                        <Workflow className="h-6 w-6 text-white" />
                                    </div>
                                    Automatiza tu Flujo de Trabajo
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                    <p className="flex-auto">
                                        Gestiona casos, asigna tareas y realiza seguimiento de avances automáticamente. Reduce el tiempo en tareas administrativas.
                                    </p>
                                </dd>
                            </div>
                            <div className="flex flex-col bg-gray-50 p-8 rounded-2xl">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                        <MessageSquare className="h-6 w-6 text-white" />
                                    </div>
                                    Comunicación Segura con Clientes
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                    <p className="flex-auto">
                                        Portal exclusivo para clientes donde pueden ver el progreso de sus casos de forma segura y mantener comunicación fluida.
                                    </p>
                                </dd>
                            </div>
                            <div className="flex flex-col bg-gray-50 p-8 rounded-2xl">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    Centro de Documentos Centralizado
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                    <p className="flex-auto">
                                        Almacena, organiza y comparte documentos de forma segura. Accede a toda la información de tus casos desde cualquier lugar.
                                    </p>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="bg-gray-50 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:max-w-4xl">
                        <div className="relative">
                            <svg className="absolute -top-6 -left-6 h-16 w-16 text-primary/20" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                            </svg>
                            <blockquote className="mt-10">
                                <p className="text-xl font-medium leading-8 text-gray-900 sm:text-2xl sm:leading-9">
                                    &quot;LexControl ha transformado la eficiencia de nuestro despacho. Ahorramos al menos 10 horas a la semana en tareas administrativas, lo que nos permite enfocarnos más en nuestros clientes. Es una herramienta indispensable para cualquier práctica legal moderna.&quot;
                                </p>
                            </blockquote>
                            <figcaption className="mt-10 flex items-center gap-x-6">
                                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                                    JR
                                </div>
                                <div className="text-sm leading-6">
                                    <div className="font-semibold text-gray-900">Juan Rodríguez</div>
                                    <div className="mt-0.5 text-gray-600">Socio Director, Rodríguez & Asociados</div>
                                </div>
                            </figcaption>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="text-base font-semibold leading-7 text-primary">Precios</h2>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Encuentra el Plan Ideal para tu Despacho
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Precios simples y transparentes. Sin costos ocultos. Cancela cuando quieras.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8">
                        {/* FREE Plan */}
                        <div className="rounded-3xl p-8 ring-1 ring-gray-200 sm:p-10">
                            <h3 className="text-base font-semibold leading-7 text-primary">Gratuito</h3>
                            <p className="mt-4 flex items-baseline gap-x-2">
                                <span className="text-5xl font-bold tracking-tight text-gray-900">$0</span>
                                <span className="text-base text-gray-500">/mes</span>
                            </p>
                            <p className="mt-6 text-base leading-7 text-gray-600">Ideal para comenzar</p>
                            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-primary" />
                                    1 Usuario
                                </li>
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-primary" />
                                    Hasta 3 Clientes
                                </li>
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-primary" />
                                    1 Caso Activo
                                </li>
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-primary" />
                                    100 MB Almacenamiento
                                </li>
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-primary" />
                                    Funciones Básicas
                                </li>
                            </ul>
                            <Link
                                href="/auth/register"
                                className="mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-primary ring-1 ring-inset ring-primary hover:ring-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                                Comenzar
                            </Link>
                        </div>

                        {/* SOLO Plan - Destacado */}
                        <div className="relative rounded-3xl bg-primary p-8 shadow-2xl ring-1 ring-gray-900/10 sm:p-10">
                            <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20 text-center">
                                Recomendado
                            </div>
                            <h3 className="text-base font-semibold leading-7 text-white">Solo</h3>
                            <p className="mt-4 flex items-baseline gap-x-2">
                                <span className="text-5xl font-bold tracking-tight text-white">$400</span>
                                <span className="text-base text-white/80">MXN/mes</span>
                            </p>
                            <p className="mt-6 text-base leading-7 text-white/80">Para abogados independientes y pequeños despachos</p>
                            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-white/90">
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-white" />
                                    1 Usuario
                                </li>
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-white" />
                                    Clientes Ilimitados
                                </li>
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-white" />
                                    Casos Ilimitados
                                </li>
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-white" />
                                    10 GB Almacenamiento
                                </li>
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-white" />
                                    Portal para Clientes
                                </li>
                                <li className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-white" />
                                    Soporte Prioritario
                                </li>
                            </ul>
                            <Link
                                href="#contact"
                                className="mt-8 block rounded-md bg-white px-3.5 py-2.5 text-center text-sm font-semibold text-primary shadow-sm hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Contáctanos
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900" aria-labelledby="footer-heading">
                <h2 id="footer-heading" className="sr-only">Footer</h2>
                <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                    <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                        <div className="space-y-8">
                            <span className="text-2xl font-bold text-white">LexControl</span>
                            <p className="text-sm leading-6 text-gray-300">
                                Simplificando la gestión legal para abogados y despachos modernos.
                            </p>
                        </div>
                        <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-semibold leading-6 text-white">PRODUCTO</h3>
                                    <ul role="list" className="mt-6 space-y-4">
                                        <li><Link href="#features" className="text-sm leading-6 text-gray-300 hover:text-white">Características</Link></li>
                                        <li><Link href="#pricing" className="text-sm leading-6 text-gray-300 hover:text-white">Precios</Link></li>
                                        <li><Link href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Seguridad</Link></li>
                                        <li><Link href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Soporte & Demo</Link></li>
                                    </ul>
                                </div>
                                <div className="mt-10 md:mt-0">
                                    <h3 className="text-sm font-semibold leading-6 text-white">EMPRESA</h3>
                                    <ul role="list" className="mt-6 space-y-4">
                                        <li><Link href="#about" className="text-sm leading-6 text-gray-300 hover:text-white">Acerca de</Link></li>
                                        <li><Link href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Carreras</Link></li>
                                        <li><Link href="/privacy" className="text-sm leading-6 text-gray-300 hover:text-white">Política de Privacidad</Link></li>
                                        <li><Link href="/terms" className="text-sm leading-6 text-gray-300 hover:text-white">Términos de Servicio</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
                        <p className="text-xs leading-5 text-gray-400">&copy; {new Date().getFullYear()} LexControl. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
