# Panel de Abogados - Frontend

Sistema de gestión para despachos de abogados desarrollado con Next.js 15, que permite la administración de casos, clientes, documentos y comunicación entre abogados y clientes.

## Características

- **Gestión de Casos**: Crear, editar y dar seguimiento a casos legales
- **Portal de Clientes**: Acceso seguro para que los clientes vean el progreso de sus casos
- **Calendario**: Programación de citas y eventos relacionados con casos
- **Documentos**: Subida y gestión de archivos por caso
- **Actualizaciones**: Sistema de timeline para el seguimiento de avances
- **Autenticación**: Sistema de roles (propietario, abogado, cliente)
- **Invitaciones**: Sistema de invitación por email para nuevos clientes

## Tecnologías

- **Framework**: Next.js 15 con App Router
- **UI**: Tailwind CSS + shadcn/ui
- **Estado**: Zustand
- **Iconos**: Lucide React
- **Calendario**: FullCalendar
- **Notificaciones**: Sonner
- **Fechas**: date-fns
- **TypeScript**: Tipado completo

## Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd abogados_frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo con Turbopack
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## Estructura del Proyecto

```
src/
├── app/
│   ├── auth/           # Páginas de autenticación
│   ├── dashboard/      # Panel principal
│   │   ├── cases/      # Gestión de casos
│   │   ├── clients/    # Gestión de clientes
│   │   └── calendar/   # Calendario
│   ├── portal-cliente/ # Portal para clientes
│   ├── components/     # Componentes compartidos
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilidades y configuración
│   ├── store/          # Estado global (Zustand)
│   └── types/          # Definiciones de TypeScript
└── components/ui/      # Componentes de UI (shadcn)
```

## Funcionalidades Principales

### Dashboard de Abogados
- Lista y gestión de casos
- Creación de actualizaciones con timeline
- Gestión de clientes
- Calendario de eventos
- Subida de documentos

### Portal de Clientes
- Vista de casos asignados
- Seguimiento de actualizaciones
- Descarga de documentos
- Comunicación con el abogado

### Sistema de Roles
- **Owner**: Acceso completo al sistema
- **Lawyer**: Gestión de casos y clientes asignados
- **Client**: Acceso limitado a sus casos

## Configuración

El proyecto utiliza las siguientes configuraciones:

- **ESLint**: Configuración estándar de Next.js
- **Tailwind CSS**: Framework de utilidades CSS
- **TypeScript**: Configuración estricta
- **shadcn/ui**: Componentes de UI accesibles

## Notas Técnicas

- El proyecto utiliza Next.js 15 con el App Router
- Se implementa Server Components donde es posible
- El estado se maneja con Zustand para simplicidad
- Los tipos TypeScript están centralizados en `src/app/types/`
- Los componentes UI siguen el patrón de shadcn/ui