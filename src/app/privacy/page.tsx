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
                    AVISO DE PRIVACIDAD INTEGRAL
                </h1>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="text-gray-600 text-lg mb-8">
                        Fecha de última actualización: 02 de Febrero de 2026.
                    </p>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. IDENTIDAD Y DOMICILIO DEL RESPONSABLE</h2>
                        <p className="leading-relaxed">
                            LexControl (en adelante, &quot;El Responsable&quot;), con domicilio fiscal ubicado la ciudad de
                            Santiago de Querétaro, Querétaro, México, es el responsable del uso y protección de sus
                            datos personales, y al respecto le informa lo siguiente:
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. DATOS PERSONALES QUE RECABAMOS</h2>
                        <p className="leading-relaxed mb-4">
                            Para llevar a cabo las finalidades descritas en el presente Aviso de Privacidad, utilizaremos
                            las siguientes categorías de datos personales:
                        </p>
                        <ul className="list-disc pl-6 space-y-4 mb-4">
                            <li><strong>Datos de Identificación:</strong> Nombre completo, nombre de usuario.</li>
                            <li><strong>Datos de Contacto:</strong> Correo electrónico.</li>
                            <li><strong>Datos Laborales:</strong> Puesto o empresa (opcional, si aplica para facturación).</li>
                            <li>
                                <strong>Datos Patrimoniales y Financieros:</strong> Información necesaria para el procesamiento
                                de pagos.
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li><em>Nota:</em> El Responsable NO almacena números completos de tarjetas de
                                    crédito/débito ni códigos de seguridad (CVV). Estos son procesados
                                    directamente por la pasarela de pagos (ver numeral 5). Nosotros solo
                                    conservamos referencias (tokens), los últimos 4 dígitos de la tarjeta y el
                                    historial de transacciones.</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Tratamiento de Datos de Terceros (Clientes del Usuario):</strong> En los casos donde el
                                Usuario (Abogado/Firma) aloje datos personales de sus propios clientes en la
                                plataforma (ej. en el &quot;Portal del Cliente&quot;), LexControl funge únicamente como
                                ENCARGADO del tratamiento en términos del artículo 10 de la LFPDPPP,
                                limitándose a almacenar y procesar dicha información siguiendo las instrucciones del
                                Usuario. El Usuario (Abogado) mantiene la calidad de RESPONSABLE frente a los
                                titulares de dichos datos.
                            </li>
                            <li>
                                <strong>Sobre los Archivos Cargados (Data Files):</strong> La información contenida dentro de los
                                archivos (CSV, Excel, JSON, PDF, JPG, PNG, ...) que usted carga a la plataforma para su
                                procesamiento (&quot;Contenido del Usuario&quot;) no se considera dato personal recabado por El
                                Responsable para fines de propiedad, sino información confiada temporalmente para la
                                prestación del servicio de cómputo. Usted mantiene la titularidad y responsabilidad legal
                                sobre el contenido de dichos archivos.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. DATOS SENSIBLES</h2>
                        <p className="leading-relaxed">
                            El Responsable NO solicita datos personales sensibles (como origen racial, salud,
                            creencias religiosas, afiliación política, etc.) para el uso de la plataforma. Se advierte al
                            Usuario que no debe cargar archivos que contengan datos sensibles de terceros sin
                            contar con las debidas medidas de seguridad, encriptación y consentimientos legales
                            previos. El Usuario asume total responsabilidad si incumple esta disposición.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. FINALIDADES DEL TRATAMIENTO</h2>
                        <p className="leading-relaxed mb-4">
                            Los datos personales que recabamos de usted los utilizaremos para las siguientes
                            finalidades:
                        </p>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">A. Finalidades Primarias (Necesarias para el servicio):</h3>
                        <ol className="list-decimal pl-6 space-y-2 mb-6">
                            <li>Verificar y confirmar su identidad para crear su cuenta de usuario.</li>
                            <li>Proveer los servicios de alojamiento de expedientes, gestión de flujo de trabajo
                            legal y automatización de notificaciones (SaaS).</li>
                            <li>Habilitar el &quot;Portal del Cliente&quot; para la visualización restringida de estatus procesal.</li>
                            <li>Procesar los pagos y la facturación de las suscripciones correspondientes.</li>
                            <li>Garantizar la seguridad de la información y prevenir fraudes.</li>
                            <li>Atender solicitudes de soporte técnico y aclaraciones.</li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">B. Finalidades Secundarias (Opcionales):</h3>
                        <ol className="list-decimal pl-6 space-y-2 mb-4">
                            <li>Envío de boletines informativos, actualizaciones del sistema o promociones.</li>
                            <li>Análisis estadístico anonimizado para mejorar nuestros algoritmos de
                            recomendación.</li>
                        </ol>
                        <p className="leading-relaxed mt-4">
                            En caso de que no desee que sus datos personales sean tratados para estos fines
                            secundarios, usted puede presentar desde este momento un escrito vía correo electrónico a
                            contacto@lexcontrol.com.mx.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. TRANSFERENCIAS DE DATOS Y PROCESAMIENTO DE PAGOS</h2>
                        <p className="leading-relaxed mb-4">
                            Sus datos personales pueden ser transferidos y tratados dentro y fuera del país por
                            personas distintas a El Responsable. En ese sentido, su información puede ser compartida
                            con:
                        </p>
                        <ol className="list-decimal pl-6 space-y-4">
                            <li><strong>Autoridades competentes:</strong> En los casos legalmente previstos por la Ley.</li>
                            <li><strong>Proveedores de Infraestructura:</strong> Servicios de alojamiento en la nube (como Vercel,
                            AWS o Google Cloud) necesarios para la operación técnica de la plataforma.</li>
                            <li>
                                <strong>Stripe, Inc. (Pasarela de Pagos):</strong> Le informamos que, para procesar los pagos
                                dentro de la plataforma, utilizamos los servicios de Stripe. De conformidad con el
                                artículo 36, fracción IV y VII de la LFPDPPP, sus datos financieros son transferidos a
                                Stripe bajo las siguientes condiciones:
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li>El Responsable NO tiene acceso a su número completo de tarjeta ni CVV.
                                    Esta información viaja encriptada directamente a los servidores de Stripe.</li>
                                    <li>Únicamente compartimos los metadatos necesarios para vincular el pago con
                                    su cuenta (ID de cliente, monto).</li>
                                    <li>Al realizar un pago, usted consiente expresamente esta transferencia por ser
                                    indispensable para el cumplimiento del contrato de servicios.</li>
                                </ul>
                            </li>
                        </ol>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. SEGURIDAD Y ALMACENAMIENTO DE LA INFORMACIÓN</h2>
                        <p className="leading-relaxed mb-4">
                            Para proteger la confidencialidad de los expedientes:
                        </p>
                        <ul className="list-disc pl-6 space-y-4">
                            <li><strong>Encriptación:</strong> Los datos se transmiten (SSL/TLS) y se almacenan en reposo
                            (Encryption at Rest) utilizando estándares de la industria.</li>
                            <li><strong>Aislamiento Lógico:</strong> La arquitectura de la base de datos está diseñada para
                            asegurar que la información de un despacho no sea accesible por otros usuarios de
                            la plataforma.</li>
                            <li><strong>Temporalidad:</strong> La información se conserva en nuestros servidores mientras la
                            relación contractual (suscripción) permanezca vigente. Tras la cancelación de la
                            cuenta, se aplicarán las políticas de eliminación segura descritas en los Términos y
                            Condiciones (periodo de gracia de 30 días y posterior borrado definitivo).</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. DERECHOS ARCO</h2>
                        <p className="leading-relaxed mb-4">
                            Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los
                            utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho
                            solicitar la corrección de su información personal en caso de que esté desactualizada, sea
                            inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de
                            datos cuando considere que la misma no está siendo utilizada adecuadamente
                            (Cancelación); así como oponerse al uso de sus datos personales para fines específicos
                            (Oposición).
                        </p>
                        <p className="leading-relaxed">
                            Para ejercer cualquiera de los derechos ARCO, deberá presentar la solicitud respectiva a
                            través del correo electrónico: contacto@lexcontrol.com.mx.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. USO DE COOKIES Y TECNOLOGÍAS DE RASTREO</h2>
                        <p className="leading-relaxed mb-4">
                            Le informamos que en nuestra página de Internet utilizamos cookies, web beacons y otras
                            tecnologías a través de las cuales es posible monitorear su comportamiento como usuario
                            de Internet, con el fin de brindarle un mejor servicio y experiencia de usuario al navegar en
                            nuestra página (ej. mantener su sesión iniciada, recordar su preferencia de modo
                            oscuro/claro).
                        </p>
                        <p className="leading-relaxed mb-4">
                            Los datos personales que obtenemos de estas tecnologías de rastreo son: identificadores,
                            nombre de usuario y preferencias de visualización. Estas tecnologías pueden deshabilitarse
                            en la configuración de su navegador.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. CAMBIOS AL AVISO DE PRIVACIDAD</h2>
                        <p className="leading-relaxed mb-4">
                            El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones
                            derivadas de nuevos requerimientos legales; de nuestras propias necesidades por los
                            productos o servicios que ofrecemos; de nuestras prácticas de privacidad; o de cambios en
                            nuestro modelo de negocio.
                        </p>
                        <p className="leading-relaxed">
                            Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el
                            presente aviso de privacidad a través de: NOTIFICACIÓN EN EL DASHBOARD.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
