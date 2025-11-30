import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
                    Política de Privacidad
                </h1>

                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 text-lg mb-8">
                        Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
                        <p className="text-gray-700 leading-relaxed">
                            En LexControl, nos comprometemos a proteger su privacidad y la seguridad de su información personal. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestro servicio.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Información que Recopilamos</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Información que Usted Proporciona</h3>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li><strong>Información de registro:</strong> Nombre completo, dirección de correo electrónico, contraseña</li>
                            <li><strong>Información de perfil:</strong> Número de teléfono, título profesional, foto de perfil</li>
                            <li><strong>Información de clientes:</strong> Datos de clientes que usted ingresa en la plataforma</li>
                            <li><strong>Información de casos:</strong> Detalles de casos, documentos, notas y actualizaciones</li>
                            <li><strong>Información de facturación:</strong> Datos de facturación y pagos</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Información Recopilada Automáticamente</h3>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li><strong>Datos de uso:</strong> Páginas visitadas, funciones utilizadas, tiempo de uso</li>
                            <li><strong>Información del dispositivo:</strong> Tipo de dispositivo, sistema operativo, navegador</li>
                            <li><strong>Dirección IP:</strong> Para seguridad y análisis</li>
                            <li><strong>Cookies:</strong> Para mejorar la experiencia del usuario</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cómo Usamos su Información</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Utilizamos la información recopilada para:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Proporcionar, mantener y mejorar nuestros servicios</li>
                            <li>Procesar transacciones y enviar confirmaciones</li>
                            <li>Enviar comunicaciones administrativas y actualizaciones del servicio</li>
                            <li>Responder a sus comentarios, preguntas y solicitudes de soporte</li>
                            <li>Monitorear y analizar tendencias, uso y actividades</li>
                            <li>Detectar, prevenir y abordar problemas técnicos y de seguridad</li>
                            <li>Cumplir con obligaciones legales</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartir su Información</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            No vendemos su información personal. Podemos compartir su información en las siguientes circunstancias:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li><strong>Con su consentimiento:</strong> Cuando usted nos autorice explícitamente</li>
                            <li><strong>Proveedores de servicios:</strong> Con terceros que nos ayudan a operar nuestro servicio (hosting, procesamiento de pagos, análisis)</li>
                            <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o para proteger nuestros derechos</li>
                            <li><strong>Transferencias comerciales:</strong> En caso de fusión, adquisición o venta de activos</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Seguridad de los Datos</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Implementamos medidas de seguridad técnicas y organizativas para proteger su información:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Cifrado de datos en tránsito y en reposo (SSL/TLS)</li>
                            <li>Autenticación segura y gestión de contraseñas</li>
                            <li>Controles de acceso estrictos</li>
                            <li>Monitoreo continuo de seguridad</li>
                            <li>Copias de seguridad regulares</li>
                            <li>Auditorías de seguridad periódicas</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. No podemos garantizar la seguridad absoluta de su información.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Retención de Datos</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Conservamos su información personal durante el tiempo que su cuenta esté activa o según sea necesario para proporcionarle servicios. También conservamos y utilizamos su información según sea necesario para cumplir con nuestras obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sus Derechos</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Usted tiene derecho a:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li><strong>Acceso:</strong> Solicitar una copia de su información personal</li>
                            <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                            <li><strong>Eliminación:</strong> Solicitar la eliminación de su información personal</li>
                            <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado</li>
                            <li><strong>Oposición:</strong> Oponerse al procesamiento de su información</li>
                            <li><strong>Restricción:</strong> Solicitar la limitación del procesamiento</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            Para ejercer estos derechos, contáctenos en soporte@lexcontrol.com
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies y Tecnologías Similares</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Utilizamos cookies y tecnologías similares para:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Mantener su sesión activa</li>
                            <li>Recordar sus preferencias</li>
                            <li>Analizar el uso del servicio</li>
                            <li>Mejorar la seguridad</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            Puede configurar su navegador para rechazar cookies, pero esto puede afectar la funcionalidad del servicio.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Privacidad de Menores</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Nuestro servicio no está dirigido a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si descubrimos que hemos recopilado información de un menor, tomaremos medidas para eliminarla.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Transferencias Internacionales</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Su información puede ser transferida y mantenida en servidores ubicados fuera de su país de residencia. Tomamos medidas para garantizar que su información reciba un nivel adecuado de protección.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Cambios a esta Política</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios significativos publicando la nueva política en esta página y actualizando la fecha de "Última actualización". Le recomendamos revisar esta política periódicamente.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contacto</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Si tiene preguntas sobre esta Política de Privacidad o sobre cómo manejamos su información personal, puede contactarnos en:
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
