import Link from 'next/link';
import { ArrowLeft, Shield, Lock, FileCheck, Landmark, Mail, AlertCircle, Building2 } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors">
            <div className="mx-auto max-w-4xl px-6 py-12 sm:py-20">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 mb-8 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al inicio
                </Link>

                <div className="flex items-center gap-3 mb-4 text-primary">
                    <Shield className="h-8 w-8" />
                    <span className="text-xl font-bold tracking-tight">LexControl LegalTech</span>
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl mb-4 text-foreground">
                    AVISO DE PRIVACIDAD INTEGRAL
                </h1>

                <p className="text-sm text-muted-foreground mb-8">
                    Conforme a la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> (Nueva Ley expedida mediante Decreto publicado en el Diario Oficial de la Federación el 20 de marzo de 2025; última reforma DOF 14 de noviembre de 2025).
                    <br />
                    Última actualización: <strong>27 de octubre de 2026</strong> | Santiago de Querétaro, Querétaro, México.
                </p>

                <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
                    {/* 1. Identidad y Domicilio */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span>1.</span> IDENTIDAD Y DOMICILIO DEL RESPONSABLE
                        </h2>
                        <p>
                            En cumplimiento de lo dispuesto por los <strong>artículos 14, 15 fracción I y 16 de la LFPDPPP</strong>, <strong>LexControl</strong> (en adelante, &quot;El Responsable&quot;), con domicilio convencional para oír y recibir notificaciones en la ciudad de <strong>Santiago de Querétaro, Querétaro, México</strong>, y con correo electrónico institucional de atención a la privacidad <strong>contacto@lexcontrol.com.mx</strong>, es responsable del tratamiento legítimo, controlado, informado y confidencial de sus datos personales.
                        </p>
                    </section>

                    {/* 2. Doble Carácter: Responsable vs Encargado */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            <span>2.</span> CALIDAD DE TRATAMIENTO: RESPONSABLE VS. PERSONA ENCARGADA
                        </h2>
                        <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-2 text-foreground/90">
                            <p>
                                De estricta conformidad con los <strong>artículos 2 (fracciones XII, XIV, XVI y XVIII), 6, 13 y 20 de la LFPDPPP</strong>, el tratamiento de datos personales en la plataforma LexControl opera bajo dos calidades jurídicas diferenciadas:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground">
                                <li>
                                    <strong className="text-foreground">LexControl como RESPONSABLE (Art. 2, Fracción XIV):</strong> Respecto de los datos personales de identificación, contacto, facturación, cédula profesional emitida por la DGP y credenciales de acceso recabados directamente de los Abogados Titulares y Abogados Colaboradores para la suscripción y administración de la plataforma SaaS.
                                </li>
                                <li>
                                    <strong className="text-foreground">LexControl como PERSONA ENCARGADA (Art. 2, Fracción XII):</strong> Respecto de los expedientes judiciales, partes procesales, promociones, pruebas y datos personales de justiciables (clientes del despacho) que los usuarios abogados capturan o alojan en la nube. En dicho supuesto, el <strong>Abogado o Despacho Jurídico funge como el RESPONSABLE</strong> primario frente a sus representados, y LexControl interviene única y exclusivamente como <strong>PERSONA ENCARGADA</strong> que realiza operaciones de almacenamiento, cómputo automatizado y seguridad técnica por cuenta y bajo instrucciones directas del despacho.
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* 3. Datos Personales Recabados */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-primary" />
                            <span>3.</span> DATOS PERSONALES QUE RECABAMOS
                        </h2>
                        <p>
                            En términos del <strong>artículo 15, fracción II de la LFPDPPP</strong>, para cumplir con las finalidades de uso del software, recabamos las siguientes categorías de datos personales:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-sm">
                            <li>
                                <strong>Datos de Identificación y Contacto:</strong> Nombre completo, correo electrónico, número telefónico celular o fijo, nombre o denominación del despacho o firma legal, y credenciales de usuario.
                            </li>
                            <li>
                                <strong>Datos Académicos y Profesionales:</strong> Número de Cédula Profesional emitida por la Dirección General de Profesiones de la Secretaría de Educación Pública (DGP-SEP), institución universitaria de egreso, grado académico, rol profesional asignado dentro de la firma y archivo probatorio en formato digital (PDF o imagen de la cédula o patente).
                            </li>
                            <li>
                                <strong>Datos de Trazabilidad Financiera y Honorarios:</strong> Claves de rastreo del Sistema de Pagos Electrónicos Interbancarios (SPEI emitidas bajo la infraestructura de Banco de México), folios de autorización y liquidación bancaria, institución financiera emisora y comprobantes digitales en PDF para el registro y conciliación de abonos a cuentas por cobrar.
                            </li>
                            <li>
                                <strong>Protección de Datos Bancarios y Tarjetas (Estándar PCI-DSS):</strong> LexControl <strong>NO almacena números completos de tarjetas bancarias, fechas de vencimiento ni códigos de seguridad (CVV/CVC)</strong>. Dichos datos son capturados y procesados con cifrado bancario directamente por <strong>Stripe, Inc.</strong> Nosotros únicamente conservamos el identificador del cliente en Stripe (<em>Customer ID</em>), los últimos 4 dígitos y la marca emisora para efectos de comprobación contable.
                            </li>
                        </ul>
                    </section>

                    {/* 4. Datos Personales Sensibles */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            <span>4.</span> DATOS PERSONALES SENSIBLES
                        </h2>
                        <p>
                            De conformidad con los <strong>artículos 2 (fracción VI), 8 y 9 de la LFPDPPP</strong>, El Responsable <strong>NO solicita datos personales sensibles</strong> (origen racial o étnico, estado de salud presente o futuro, información genética, creencias religiosas, filosóficas o morales, afiliación sindical, opiniones políticas o preferencia sexual) para la apertura de cuenta o contratación de la plataforma.
                        </p>
                        <p className="text-sm">
                            En el evento de que los expedientes litigiosos, autos judiciales o promociones alojados por el Usuario Abogado contengan datos sensibles de sus clientes o contrapartes procesales, el Usuario (en su carácter de Responsable primario) manifiesta bajo protesta de decir verdad que cuenta con el consentimiento expreso y por escrito de la persona titular en términos del <strong>artículo 8 de la LFPDPPP</strong>, o que su tratamiento se encuentra justificado por las excepciones del <strong>artículo 9, fracciones IV o VI</strong> (relación jurídica, deber de secreto profesional u orden fundada de autoridad judicial).
                        </p>
                    </section>

                    {/* 5. Finalidades del Tratamiento */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span>5.</span> FINALIDADES DEL TRATAMIENTO
                        </h2>
                        <p>
                            En observancia de los principios de finalidad y proporcionalidad consagrados en los <strong>artículos 5, 11, 12 y 15 fracción III de la LFPDPPP</strong>, sus datos serán tratados para:
                        </p>
                        
                        <div className="space-y-2">
                            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">A. Finalidades Primarias (Estrictamente necesarias para el servicio):</h3>
                            <ol className="list-decimal pl-6 space-y-1.5 text-sm">
                                <li>Crear, autenticar, dar de alta y administrar su cuenta de usuario y espacio de trabajo de despacho (Workspace).</li>
                                <li>Verificar y acreditar la habilitación legal y cédula profesional del abogado ante la Dirección General de Profesiones.</li>
                                <li>Proveer el servicio de administración de expedientes, cálculo asistido de términos judiciales y semáforo preventivo de plazos fatales.</li>
                                <li>Habilitar el Portal del Cliente para consulta remota y segura del estatus procesal y recibos por parte del justiciable.</li>
                                <li>Procesar el cobro de suscripciones mensuales y anuales mediante Stripe y generar los comprobantes fiscales digitales por Internet (CFDI) correspondientes.</li>
                                <li>Garantizar el aislamiento lógico y la confidencialidad de los expedientes bajo deber de secreto profesional.</li>
                                <li>Brindar soporte técnico especializado y velar por la seguridad integral del software.</li>
                            </ol>
                        </div>

                        <div className="space-y-2 pt-2">
                            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">B. Finalidades Secundarias (Accesorias):</h3>
                            <ul className="list-disc pl-6 space-y-1 text-sm">
                                <li>Envío de comunicaciones sobre nuevas funciones en la plataforma, boletines de LegalTech y actualizaciones de planes.</li>
                                <li>Elaboración de estadísticas de uso anonimizadas para la optimización de los sistemas y tiempos de respuesta.</li>
                            </ul>
                            <p className="text-xs pt-1">
                                Para manifestar su negativa al tratamiento de datos para finalidades secundarias, bastará enviar un correo electrónico a <strong>contacto@lexcontrol.com.mx</strong> con el asunto &quot;Negativa de Finalidades Secundarias&quot;.
                            </p>
                        </div>
                    </section>

                    {/* 6. Transferencias de Datos */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-primary" />
                            <span>6.</span> TRANSFERENCIAS DE DATOS PERSONALES
                        </h2>
                        <p>
                            Conforme a los <strong>artículos 35 y 36 de la LFPDPPP</strong>, sus datos personales no serán transferidos, vendidos ni compartidos con terceros distintos a los indispensables para la operatividad del software, sustentándose en las excepciones al consentimiento del <strong>artículo 36, fracciones IV, V y VII de la LFPDPPP</strong>:
                        </p>
                        <ul className="list-disc pl-6 space-y-1.5 text-sm">
                            <li>
                                <strong>Proveedores de Infraestructura en la Nube:</strong> Amazon Web Services (AWS) y Vercel, Inc., para el alojamiento seguro de la base de datos PostgreSQL y la ejecución del backend/frontend bajo cláusulas de confidencialidad y cifrado (Art. 36, Fracción IV y VII).
                            </li>
                            <li>
                                <strong>Pasarela Bancaria de Pagos:</strong> Stripe Payments Mexico, S. de R.L. de C.V. y Stripe, Inc., para el procesamiento de cargos recurrentes de suscripciones (Art. 36, Fracción IV y VII).
                            </li>
                            <li>
                                <strong>Autoridades Jurisdiccionales y Fiscales:</strong> Únicamente cuando la transferencia sea legalmente exigida para la administración de justicia o cumplimiento de requerimientos formales fundados y motivados de autoridad competente (Art. 36, Fracción V).
                            </li>
                        </ul>
                    </section>

                    {/* 7. Medidas de Seguridad */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <span>7.</span> MEDIDAS DE SEGURIDAD Y DEBER DE CONFIDENCIALIDAD
                        </h2>
                        <p>
                            En estricto apego a los <strong>artículos 18, 19 y 20 de la LFPDPPP</strong>, LexControl mantiene e implementa medidas de seguridad administrativas, técnicas y físicas para salvaguardar los datos personales contra daño, pérdida, alteración, destrucción o acceso no autorizado:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                            <li>Cifrado de datos en tránsito mediante protocolos criptográficos TLS 1.3 / SSL.</li>
                            <li>Cifrado en reposo para credenciales y contraseñas utilizando algoritmos hash robustos (bcrypt).</li>
                            <li>Aislamiento multitenant a nivel base de datos por identificador de despacho (Workspace ID).</li>
                            <li>Protocolos de respaldo automatizado diario y control estricto de accesos por roles (RBAC).</li>
                            <li>Deber de confidencialidad subsistente aun después de concluida la relación contractual (Art. 20).</li>
                            <li>Notificación inmediata a los titulares en caso de vulneraciones significativas de seguridad (Art. 19).</li>
                        </ul>
                    </section>

                    {/* 8. Procedimiento de Derechos ARCO */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span>8.</span> EJERCICIO DE DERECHOS ARCO Y REVOCACIÓN DEL CONSENTIMIENTO
                        </h2>
                        <p className="text-sm">
                            En términos de los <strong>artículos 21 al 26 (Capítulo III) y 27 al 34 (Capítulo IV) de la LFPDPPP</strong>, usted o su representante legal debidamente acreditado tienen derecho a solicitar el <strong>Acceso</strong> (Art. 22), <strong>Rectificación</strong> (Art. 23), <strong>Cancelación</strong> con periodo de bloqueo (Art. 24) u <strong>Oposición</strong> (Art. 26) respecto de sus datos personales.
                        </p>

                        <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-3 text-foreground/90">
                            <div className="font-semibold text-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4 text-primary" />
                                Requisitos y Plazos Conforme a los Artículos 28 y 31 de la LFPDPPP:
                            </div>
                            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-muted-foreground">
                                <li>
                                    <strong>Presentación y Requisitos (Art. 28):</strong> Deberá enviar su solicitud al correo <strong>contacto@lexcontrol.com.mx</strong> con: I. Nombre completo del titular y domicilio o correo para notificaciones; II. Documentos oficiales que acrediten la identidad o representación legal; III. Descripción clara y precisa de los datos sobre los que desea ejercer el derecho ARCO; IV. Manifestación expresa del derecho que desea ejercer; y V. Cualquier elemento o documento que facilite su localización.
                                </li>
                                <li>
                                    <strong>Plazo de Determinación (Art. 31, Primer Párrafo):</strong> El Responsable le comunicará la determinación adoptada en un plazo máximo de <strong>20 (veinte) días hábiles</strong> (Art. 2, Fracción VIII), contados a partir de la fecha de recepción formal de la solicitud.
                                </li>
                                <li>
                                    <strong>Plazo de Efectividad (Art. 31, Primer Párrafo):</strong> Si la solicitud resulta procedente, se hará efectiva dentro de los <strong>15 (quince) días hábiles</strong> siguientes a la fecha en que se le comunique la respuesta.
                                </li>
                                <li>
                                    <strong>Prórroga Legal Justificada (Art. 31, Segundo Párrafo):</strong> Dichos plazos podrán ser ampliados una sola vez por un periodo igual cuando así lo justifiquen las circunstancias del caso, previa notificación al titular.
                                </li>
                                <li>
                                    <strong>Gratuidad (Art. 34):</strong> El trámite de ejercicio de derechos ARCO es totalmente gratuito, salvo los costos indispensables de reproducción o envío si fueren requeridos en copias físicas.
                                </li>
                            </ol>
                        </div>
                    </section>

                    {/* 9. Autoridad Garante */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <span>9.</span> AUTORIDAD GARANTE Y PROCEDIMIENTO DE PROTECCIÓN DE DERECHOS
                        </h2>
                        <p className="text-sm">
                            De conformidad con los <strong>artículos 2 fracción XV, 38, 39 y el Capítulo VIII (artículos 40 al 53) de la LFPDPPP</strong>, así como el Decreto de expedición de la nueva Ley publicado en el Diario Oficial de la Federación el 20 de marzo de 2025 (Transitorios Cuarto, Quinto y Décimo), la autoridad competente para promover, vigilar y verificar el cumplimiento de las obligaciones en materia de protección de datos personales en el ámbito federal y substanciar las inconformidades de los particulares es la <strong>Secretaría Anticorrupción y Buen Gobierno</strong>.
                        </p>
                        <p className="text-sm">
                            Si usted considera que su derecho a la protección de datos personales ha sido conculcado o que la atención a su solicitud de Derechos ARCO no ha sido debidamente satisfecha por El Responsable dentro de los plazos normativos, podrá interponer formal <strong>Solicitud de Protección de Datos ante la Secretaría Anticorrupción y Buen Gobierno</strong> dentro de los <strong>15 (quince) días hábiles</strong> siguientes a la fecha en que se le notifique la resolución o a partir del vencimiento del término para responder, de conformidad con lo establecido por el <strong>artículo 40 de la LFPDPPP</strong>.
                        </p>
                    </section>

                    {/* 10. Modificaciones */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span>10.</span> MODIFICACIONES AL AVISO DE PRIVACIDAD
                        </h2>
                        <p className="text-sm">
                            En observancia de los <strong>artículos 15 fracción VI y 16 fracción II de la LFPDPPP</strong>, El Responsable se reserva el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente Aviso de Privacidad Integral para la atención de reformas normativas, adecuaciones tecnológicas o disposiciones de la autoridad. Las modificaciones estarán permanentemente a disposición de los usuarios en esta página web, reflejando la fecha de última actualización al calce.
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© 2026 LexControl. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="font-semibold text-primary">
                            Aviso de Privacidad
                        </Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">
                            Términos de Servicio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
