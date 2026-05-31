import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al inicio
                </Link>

                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8">
                    TÉRMINOS Y CONDICIONES DE USO DE LEXCONTROL
                </h1>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="text-gray-600 text-lg mb-8">
                        Última actualización: 02 de febrero de 2026
                    </p>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. ACEPTACIÓN DE LOS TÉRMINOS</h2>
                        <p className="leading-relaxed">
                            Al registrarse, acceder o utilizar los servicios de LexControl (en adelante, &quot;La Plataforma&quot;),
                            usted (en adelante, &quot;El Usuario&quot;) acepta vincularse legalmente por estos Términos y
                            Condiciones. Si no está de acuerdo, absténgase de usar el servicio.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. DESCRIPCIÓN DEL SERVICIO</h2>
                        <p className="leading-relaxed">
                            La Plataforma es una herramienta de software como servicio (SaaS) que permite
                            modernizar la práctica legal. Centraliza la gestión de expedientes y automatiza el
                            seguimiento de plazos procesales. Su principal innovación es el &apos;Portal del Cliente&apos;, que
                            ofrece transparencia en tiempo real sobre el estatus del caso y los balances financieros,
                            eliminando la necesidad de correos constantes y fortaleciendo la confianza abogado-cliente.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. PROPIEDAD DE LOS DATOS Y LICENCIA</h2>
                        <ul className="list-disc pl-6 space-y-4">
                            <li>
                                <strong>Licencia de Procesamiento:</strong> Al cargar archivos e información de expedientes, El
                                Usuario otorga a La Plataforma una licencia mundial, no exclusiva y libre de regalías
                                para alojar, indexar, encriptar, respaldar y visualizar dicho contenido únicamente con
                                el propósito de prestar el servicio de gestión de casos y notificaciones (ej. mostrar el
                                estatus en el Portal del Cliente, calcular fechas de plazos).
                            </li>
                            <li>
                                <strong>Propiedad del Usuario:</strong> El Usuario conserva todos los derechos de propiedad
                                intelectual sobre los archivos y datos que carga en La Plataforma (&quot;Contenido del
                                Usuario&quot;).
                            </li>
                            <li>
                                <strong>Garantía de Legalidad:</strong> El Usuario garantiza que posee los derechos necesarios
                                sobre los datos cargados y que estos no infringen derechos de terceros ni leyes
                                vigentes (ej. no subir bases de datos robadas o información sensible prohibida).
                            </li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. CONFIDENCIALIDAD Y DATOS DE TERCEROS</h2>
                        <p className="leading-relaxed">
                            LexControl reconoce la naturaleza sensible y privilegiada de la información gestionada por
                            los Usuarios (Abogados/Firmas) en relación con sus clientes. Nos comprometemos a
                            mantener la más estricta confidencialidad técnica sobre los expedientes y balances
                            financieros alojados. El Usuario (Abogado) declara que cuenta con la legitimación y los
                            avisos de privacidad necesarios para cargar en la plataforma la información de sus propios
                            clientes. LexControl actúa meramente como proveedor de infraestructura tecnológica, sin
                            tener derechos de propiedad sobre la información de los expedientes.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. POLÍTICA DE RETENCIÓN DE DATOS Y TERMINACIÓN</h2>
                        <p className="leading-relaxed mb-4">
                            Debido a la naturaleza de gestión documental del servicio:
                        </p>
                        <ul className="list-disc pl-6 space-y-4">
                            <li>
                                <strong>Almacenamiento Persistente:</strong> LexControl almacenará la información y archivos de
                                los expedientes de manera indefinida mientras la suscripción del Usuario se
                                mantenga activa y al corriente de pago.
                            </li>
                            <li>
                                <strong>Terminación del Servicio:</strong> En caso de que el Usuario cancele su suscripción o esta
                                expire por falta de pago, LexControl mantendrá la información disponible en modo
                                &quot;solo lectura&quot; o para exportación por un periodo de gracia de 30 días naturales.
                                Transcurrido este plazo, LexControl se reserva el derecho de eliminar
                                permanentemente todos los datos asociados a la cuenta para liberar espacio en
                                servidores, sin responsabilidad alguna por la pérdida de dicha información histórica.
                            </li>
                            <li>
                                <strong>Backups:</strong> Aunque LexControl realiza copias de seguridad de sus servidores, es
                                responsabilidad exclusiva del Usuario mantener sus propios respaldos locales de los
                                documentos legales críticos.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. LIMITACIÓN DE RESPONSABILIDAD (Cláusula &quot;As Is&quot;)</h2>
                        <p className="leading-relaxed mb-4">
                            El servicio se ofrece &quot;tal cual&quot; y &quot;según disponibilidad&quot;. En la máxima medida permitida
                            por la ley aplicable:
                        </p>
                        <ul className="list-disc pl-6 space-y-4">
                            <li>
                                <strong>Cálculo de Plazos:</strong> Las alertas y cálculos de plazos procesales son herramientas de
                                apoyo auxiliares. LexControl NO garantiza que las notificaciones sean infalibles ni
                                asume responsabilidad por fallas técnicas en el envío de correos o alertas push.
                            </li>
                            <li>
                                <strong>Responsabilidad Profesional:</strong> El Usuario (Abogado) reconoce que es el único
                                responsable de verificar los términos judiciales y llevar su propia agenda legal.
                                LexControl no será responsable por pérdidas de derechos procesales, multas, o
                                daños derivados de la confianza exclusiva en las alertas automatizadas de la
                                plataforma.
                            </li>
                            <li>
                                <strong>Interrupciones:</strong> No garantizamos un uptime del 100%. No seremos responsables
                                por daños indirectos derivados de interrupciones temporales del servicio (caídas del
                                servidor).
                            </li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. PROPIEDAD INTELECTUAL DE LA PLATAFORMA</h2>
                        <p className="leading-relaxed">
                            El código fuente, algoritmos, diseño de interfaz, logotipos y la estructura de la base de
                            datos son propiedad exclusiva de LexControl. El Usuario no podrá realizar ingeniería
                            inversa, descompilar o intentar extraer el código fuente.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. MODIFICACIONES</h2>
                        <p className="leading-relaxed">
                            Nos reservamos el derecho de modificar estos términos en cualquier momento.
                            Notificaremos cambios significativos a través del correo electrónico asociado a la cuenta.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. LEY APLICABLE Y JURISDICCIÓN</h2>
                        <p className="leading-relaxed">
                            Para la interpretación y cumplimiento de los presentes términos, las partes se someten a
                            las leyes y tribunales competentes de la ciudad de Santiago de Querétaro, México,
                            renunciando a cualquier otro fuero que pudiera corresponderles.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
