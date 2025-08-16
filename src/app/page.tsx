import Link from "next/link";
import { Scale, Users, Calendar, FileText, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Scale className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Panel de Abogados
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Sistema integral de gestión para despachos jurídicos. Administra casos, clientes y documentos de manera eficiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              Iniciar Sesión
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/register" className="border border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
              Registrarse
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Funcionalidades Principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Gestión de Casos</h3>
              <p className="text-slate-600">Administra y da seguimiento a todos tus casos legales en un solo lugar.</p>
            </div>
            <div className="text-center p-6">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Portal de Clientes</h3>
              <p className="text-slate-600">Acceso seguro para que los clientes vean el progreso de sus casos.</p>
            </div>
            <div className="text-center p-6">
              <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Calendario</h3>
              <p className="text-slate-600">Programa citas y eventos relacionados con tus casos.</p>
            </div>
            <div className="text-center p-6">
              <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Seguridad</h3>
              <p className="text-slate-600">Sistema de roles y autenticación para proteger la información.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para modernizar tu despacho?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Únete a los despachos que ya confían en nuestro sistema de gestión.
          </p>
          <Link href="/auth/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
            Comenzar Ahora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
