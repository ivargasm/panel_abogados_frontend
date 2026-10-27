import Link from 'next/link';
import { ArrowLeft, Scale, ShieldAlert, CreditCard, Clock, Lock, FileText } from 'lucide-react';

export default function TermsPage() {
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
                    <Scale className="h-8 w-8" />
                    <span className="text-xl font-bold tracking-tight">LexControl LegalTech</span>
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl mb-4 text-foreground">
                    TÉRMINOS Y CONDICIONES DE USO
                </h1>

                <p className="text-sm text-muted-foreground mb-8">
                    Última actualización y entrada en vigor: <strong>27 de octubre de 2026</strong> | Ciudad de Santiago de Querétaro, México.
                </p>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-10 text-sm leading-relaxed text-foreground/90 flex gap-3">
                    <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <strong>Aviso Importante al Usuario:</strong> Al registrarse, acceder o utilizar la plataforma LexControl, usted acepta sujetarse en su totalidad a los presentes Términos y Condiciones. Si no está de acuerdo con alguna de las disposiciones contenidas en este instrumento legal, deberá abstenerse de utilizar el software y sus servicios asociados.
                    </div>
                </div>

                <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
                    {/* 1. Naturaleza del Servicio y Deslinde Legal */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span>1.</span> NATURALEZA DEL SERVICIO Y DESLINDE DE ASESORÍA JURÍDICA
                        </h2>
                        <p>
                            LexControl (en adelante, &quot;La Plataforma&quot; o &quot;El Proveedor&quot;) es una solución informática bajo el modelo de Software como Servicio (SaaS) diseñada exclusivamente como herramienta auxiliar para la gestión administrativa de expedientes, cálculo asistido de plazos procesales, control interno de cobranza y portal de transparencia para clientes de despachos jurídicos.
                        </p>
                        <div className="rounded-lg border bg-muted/40 p-4 text-sm text-foreground/90 font-medium">
                            ⚖️ <strong>DESLINDE LEGAL EXPRESO:</strong> LexControl NO es una firma de abogados, no presta servicios de asesoría jurídica, procuración o patrocinio legal, ni sustituye el criterio, conocimiento o pericia del profesional del Derecho. El uso de La Plataforma no genera una relación abogado-cliente entre LexControl y El Usuario, ni garantiza sentencias, acuerdos favorables o el éxito de ningún procedimiento judicial o arbitral.
                        </div>
                    </section>

                    {/* 2. Cuentas de Usuario y Regla Antifraude */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span>2.</span> CUENTAS DE USUARIO, HABILITACIÓN Y REGLA DE UN SOLO DESPACHO TITULAR
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Capacidad y Habilitación Profesional:</strong> Los usuarios que se registren como Titulares (<em>OWNER</em>) o Abogados Colaboradores (<em>LAWYER</em>) manifiestan bajo protesta de decir verdad que cuentan con cédula profesional legalmente expedida por la Dirección General de Profesiones de la Secretaría de Educación Pública (SEP) o, en su caso, con autorización legal para litigar en los términos de la legislación procesal correspondiente.
                            </li>
                            <li>
                                <strong>Regla de Un Solo Despacho Titular (Anti-Abuso):</strong> Cada cuenta de usuario (correo electrónico único) tiene derecho a crear y fungir como Titular (<em>OWNER</em>) de <strong>un solo despacho o firma legal</strong>. Queda estrictamente prohibida la creación de múltiples cuentas o despachos gratuitos con el objeto de eludir los límites de clientes o expedientes del Plan Inicial. En caso de detectar conductas orientadas a evadir los límites comerciales, LexControl se reserva el derecho de suspender o consolidar dichas cuentas.
                            </li>
                            <li>
                                <strong>Colaboraciones Ilimitadas:</strong> El Usuario podrá pertenecer y colaborar como asociado o pasante (<em>LAWYER</em>) en múltiples despachos a los que sea debidamente invitado sin restricción de número.
                            </li>
                            <li>
                                <strong>Custodia de Credenciales:</strong> El Usuario es el único responsable de salvaguardar sus credenciales de acceso y de cualquier actividad realizada a través de su cuenta.
                            </li>
                        </ul>
                    </section>

                    {/* 3. Planes de Suscripción, Pagos y Prorrateo */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <span>3.</span> PLANES DE SUSCRIPCIÓN, FACTURACIÓN Y PRORRATEO EN STRIPE
                        </h2>
                        <p>
                            El acceso a las funcionalidades extendidas de La Plataforma se rige por los esquemas de suscripción vigentes: Plan Inicial (Gratuito), Plan Abogado Independiente y Plan Despacho Jurídico, en modalidades de facturación mensual o anual.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Procesamiento Seguro vía Stripe:</strong> Los pagos de suscripciones se procesan mediante la infraestructura bancaria global de <strong>Stripe, Inc.</strong> El Usuario autoriza los cargos recurrentes automáticos a su método de pago registrado al inicio de cada periodo de facturación.
                            </li>
                            <li>
                                <strong>Prorrateo Inmediato (Upgrades):</strong> En caso de que El Usuario modifique su suscripción hacia un plan superior o cambie a facturación anual, Stripe calculará automáticamente el saldo proporcional no consumido de su periodo previo y facturará únicamente la diferencia neta de inmediato (<em>proration behavior: always invoice</em>), activándose los nuevos límites en tiempo real.
                            </li>
                            <li>
                                <strong>Política de Cancelación y Reembolsos:</strong> El Usuario puede cancelar su suscripción en cualquier momento a través del Portal de Facturación. La cancelación surtirá efectos al término del periodo de facturación en curso, conservando acceso a las funciones pagadas hasta dicha fecha. Las tarifas devengadas no son reembolsables por periodos parciales ya transcurridos.
                            </li>
                        </ul>
                    </section>

                    {/* 4. Propiedad Intelectual y de los Datos */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <span>4.</span> PROPIEDAD INTELECTUAL Y TITULARIDAD DE LA INFORMACIÓN
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Propiedad del Usuario:</strong> El Usuario conserva la titularidad absoluta y exclusiva de los derechos sobre todos los expedientes, escritos, contratos, notas procesales y documentos cargados a La Plataforma (&quot;Contenido del Usuario&quot;). LexControl no adquiere derecho alguno sobre dichos activos.
                            </li>
                            <li>
                                <strong>Licencia de Operación:</strong> El Usuario concede a LexControl una licencia técnica, no exclusiva e intransferible, únicamente para alojar, cifrar, sincronizar, respaldar y desplegar el Contenido del Usuario a fin de posibilitar la operación del software y la visualización en el Portal del Cliente.
                            </li>
                            <li>
                                <strong>Propiedad de la Plataforma:</strong> Los algoritmos, código fuente, interfaces, diseños, logotipos y bases de datos son propiedad exclusiva de LexControl, estando protegidos por la Ley Federal del Derecho de Autor y la Ley Federal de Protección a la Propiedad Industrial.
                            </li>
                        </ul>
                    </section>

                    {/* 5. Secreto Profesional y Confidencialidad */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            <span>5.</span> SECRETO PROFESIONAL Y DEONTOLOGÍA JURÍDICA
                        </h2>
                        <p>
                            En cabal apego a la legislación procesal civil y penal mexicana, a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (DOF 20-03-2025) y al Código de Ética Profesional de la Barra Mexicana, Colegio de Abogados:
                        </p>
                        <p>
                            LexControl reconoce que la información procesal alojada goza del privilegio de <strong>Secreto Profesional</strong>. La arquitectura de La Plataforma implementa aislamiento lógico multitenant y encriptación de datos, asegurando que ningún integrante ajeno a un despacho pueda acceder a sus expedientes. El secreto profesional subsiste exclusivamente entre el abogado postulante y su cliente; LexControl funge estrictamente como proveedor de infraestructura tecnológica neutral y no monitorea ni explota comercialmente las comunicaciones privilegiadas.
                        </p>
                    </section>

                    {/* 6. Cómputo de Términos Procesales */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <span>6.</span> CÓMPUTO DE TÉRMINOS Y RESPONSABILIDAD PROCESAL
                        </h2>
                        <p>
                            El módulo de Calendario y el Semáforo de Términos Fatales son herramientas tecnológicas de organización auxiliar.
                        </p>
                        <div className="rounded-lg border bg-muted/40 p-4 text-sm text-foreground/90">
                            <strong>RESPONSABILIDAD PROCESAL EXCLUSIVA:</strong> El cómputo legal de los términos, plazos y requerimientos judiciales (conforme al Código Nacional de Procedimientos Civiles y Familiares, Códigos de Procedimientos Civiles locales, Código de Comercio, Ley de Amparo y demás leyes aplicables) es <strong>responsabilidad estricta y exclusiva del abogado postulante</strong>. LexControl no responderá por preclusiones de derechos, desechamientos de recursos, declaraciones de rebeldía o sanciones derivadas del cómputo judicial o fallas temporales en notificaciones electrónicas.
                        </div>
                    </section>

                    {/* 7. Retención y Periodo de Gracia */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span>7.</span> RETENCIÓN DE EXPEDIENTES, GRACIA Y TERMINACIÓN
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Persistencia Activa:</strong> Mientras la suscripción se encuentre activa y al corriente de pago, LexControl mantendrá los expedientes y archivos de manera indefinida.
                            </li>
                            <li>
                                <strong>Periodo de Gracia de 30 Días:</strong> En caso de cancelación de la cuenta o falta de pago no subsanada, se concederá un periodo de gracia de <strong>30 (treinta) días naturales</strong> en modalidad de solo lectura para permitir la exportación de documentos. Concluido este plazo, LexControl podrá proceder a la depuración definitiva del almacenamiento para salvaguardar la privacidad y liberar servidores.
                            </li>
                            <li>
                                <strong>Deber de Respaldo Local:</strong> Es obligación del Usuario conservar copias de seguridad locales e independientes de sus autos, resoluciones y pruebas documentales.
                            </li>
                        </ul>
                    </section>

                    {/* 8. Disponibilidad y Limitación "As Is" */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span>8.</span> DISPONIBILIDAD DEL SERVICIO Y LIMITACIÓN DE RESPONSABILIDAD
                        </h2>
                        <p>
                            La Plataforma se suministra &quot;tal cual&quot; (<em>as is</em>) y &quot;según disponibilidad&quot;. Aunque mantenemos los más altos estándares de redundancia y seguridad en servidores, LexControl no garantiza una disponibilidad ininterrumpida del 100% ni asume responsabilidad por interrupciones atribuibles a fallas generales de Internet, caídas de centros de datos de terceros (ej. AWS, Vercel) o eventos de caso fortuito o fuerza mayor.
                        </p>
                    </section>

                    {/* 9. Jurisdicción y Ley Aplicable */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span>9.</span> JURISDICCIÓN Y LEGISLACIÓN APLICABLE
                        </h2>
                        <p>
                            Para la interpretación, exigibilidad y cumplimiento de los presentes Términos y Condiciones, las partes se someten expresamente a las leyes federales de los Estados Unidos Mexicanos y a la competencia de los tribunales competentes de la ciudad de <strong>Santiago de Querétaro, Querétaro, México</strong>, renunciando de manera irrevocable a cualquier otro fuero que por razón de sus domicilios presentes o futuros pudiera corresponderles.
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© 2026 LexControl. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-primary transition-colors">
                            Aviso de Privacidad
                        </Link>
                        <Link href="/terms" className="font-semibold text-primary">
                            Términos de Servicio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
