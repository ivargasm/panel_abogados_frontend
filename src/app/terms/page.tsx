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
                    Términos y Condiciones de Servicio
                </h1>

                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 text-lg mb-8">
                        Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Al acceder y utilizar LexControl (&quot;el Servicio&quot;), usted acepta estar sujeto a estos Términos y Condiciones de Servicio. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descripción del Servicio</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            LexControl es una plataforma de gestión legal diseñada para abogados y despachos jurídicos que proporciona:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Gestión de casos y expedientes</li>
                            <li>Administración de clientes</li>
                            <li>Control de facturación</li>
                            <li>Portal para clientes</li>
                            <li>Almacenamiento seguro de documentos</li>
                            <li>Calendario y recordatorios</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registro y Cuenta de Usuario</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Para utilizar LexControl, debe:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Proporcionar información precisa y completa durante el registro</li>
                            <li>Mantener la seguridad de su contraseña</li>
                            <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta</li>
                            <li>Ser responsable de todas las actividades que ocurran bajo su cuenta</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Planes y Pagos</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            LexControl ofrece diferentes planes de suscripción:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li><strong>Plan Gratuito:</strong> Acceso limitado a funciones básicas</li>
                            <li><strong>Plan Solo ($400 MXN/mes):</strong> Acceso completo para abogados independientes</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            Los pagos se procesan de forma segura. Puede cancelar su suscripción en cualquier momento desde la configuración de su cuenta.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Uso Aceptable</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Usted se compromete a NO:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Utilizar el servicio para fines ilegales o no autorizados</li>
                            <li>Violar leyes locales, estatales, nacionales o internacionales</li>
                            <li>Transmitir virus, malware o código malicioso</li>
                            <li>Intentar acceder sin autorización a otros sistemas o cuentas</li>
                            <li>Interferir con el funcionamiento del servicio</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propiedad Intelectual</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Todo el contenido, características y funcionalidad de LexControl son propiedad exclusiva de LexControl y están protegidos por leyes de derechos de autor, marcas registradas y otras leyes de propiedad intelectual.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacidad y Protección de Datos</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Su privacidad es importante para nosotros. Consulte nuestra <Link href="/privacy" className="text-primary hover:underline">Política de Privacidad</Link> para obtener información sobre cómo recopilamos, usamos y protegemos sus datos personales.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitación de Responsabilidad</h2>
                        <p className="text-gray-700 leading-relaxed">
                            LexControl se proporciona &quot;tal cual&quot; sin garantías de ningún tipo. No seremos responsables de daños indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de usar el servicio.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modificaciones del Servicio</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento, con o sin previo aviso. No seremos responsables ante usted ni ante terceros por cualquier modificación, suspensión o discontinuación del servicio.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Terminación</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Podemos terminar o suspender su acceso al servicio inmediatamente, sin previo aviso, por cualquier motivo, incluyendo, sin limitación, si viola estos Términos y Condiciones.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Ley Aplicable</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Estos términos se regirán e interpretarán de acuerdo con las leyes de México, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contacto</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos en:
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            <strong>Email:</strong> soporte@lexcontrol.com<br />
                            <strong>Sitio web:</strong> www.lexcontrol.com
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
