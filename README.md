# A.S.T.A. Rental (Alquileres y Gestión Inmobiliaria B2B SaaS)

A.S.T.A. Rental es una aplicación moderna de alto rendimiento B2B (Software as a Service) diseñada para agencias inmobiliarias, administradores de propiedades y propietarios independientes. Permite gestionar propiedades, inquilinos, contratos y pagos de manera centralizada.

## 🚀 Características Principales

*   **Arquitectura Multi-Tenant**: Segregación robusta de datos a nivel de organización mediante Row-Level Security (RLS) estricto en la base de datos (con usuario `app_user`), permitiendo que múltiples agencias usen la plataforma de forma segura y aislada.
*   **Agente IA y Meta API (WhatsApp)**: Integración con Inteligencia Artificial para la automatización de comunicaciones con inquilinos vía WhatsApp, incluyendo cobranzas y avisos de mora.
*   **Gestión de Propiedades e Inquilinos**: Control total sobre el estado de los inmuebles y perfiles detallados de los inquilinos con sus contratos activos.
*   **Contratos Inteligentes y Pagos**: Vinculación de propiedades con inquilinos mediante fechas y montos específicos. Generación automática de registros de pago mensuales.
*   **Control de Acceso por Roles (RBAC)**: Permisos detallados para roles de `admin` y `agent` dentro de cada organización.
*   **Tickets de Mantenimiento**: Creación y seguimiento de solicitudes de reparación vinculadas a propiedades.
*   **Seguridad y Autenticación**: Autenticación basada en JWT con rotación automática de refresh tokens y mitigación de fuerza bruta.

## 🛠 Tech Stack

### Frontend
*   **Framework**: Next.js 14 (App Router) con React 18
*   **Lenguaje**: TypeScript
*   **Estilos**: Tailwind CSS
*   **Manejo de Estado**: Zustand & React Context

### Backend (Arquitectura Hexagonal)
*   **Entorno**: Node.js & Express.js
*   **Lenguaje**: TypeScript
*   **Base de Datos**: PostgreSQL (NeonDB)
*   **ORM**: Drizzle ORM (Migraciones y esquemas tipados)
*   **Arquitectura**: Hexagonal (Puertos y Adaptadores) para desacoplar la lógica de negocio de la base de datos.
*   **Tests**: Vitest para pruebas unitarias y de integración.

### Shared Package
*   `@asta-rental/shared`: Espacio de trabajo común que comparte DTOs, esquemas Zod, tipos y constantes entre el backend y frontend.

## 📦 Estructura del Proyecto (Monorepo)

```
asta-rental/
├── frontend/      # Aplicación web en Next.js 14
├── backend/       # Servidor Express.js con Arquitectura Hexagonal
└── shared/        # Interfaces TypeScript y esquemas Zod compartidos
```

## ⚙️ Desarrollo Local

### Requisitos Previos
*   Node.js (v24+)
*   PostgreSQL

### 1. Variables de Entorno
Crear un archivo `.env.local` en `frontend/` y `.env` en `backend/` con las configuraciones locales adecuadas.

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Base de Datos y Migraciones
```bash
# Correr en la raíz del proyecto
npm run db:migrate --workspace=backend
npm run db:seed --workspace=backend
```
*El script de seed crea una organización por defecto y usuarios de prueba.*

### 4. Iniciar Servidores de Desarrollo
```bash
# Terminal 1: Iniciar frontend
npm run dev --workspace=frontend

# Terminal 2: Iniciar backend
npm run dev --workspace=backend
```
*(También podés correr `npm run dev` en la raíz para iniciar ambos al mismo tiempo).*

La aplicación estará disponible en `http://localhost:3000`.

## 🛡 Seguridad Destacada
*   **Row-Level Security (RLS)**: Aplicado a nivel de base de datos en PostgreSQL (forzando consultas a través del rol `app_user`) para garantizar el aislamiento absoluto de los datos de cada inquilino/agencia.
*   **Rotación de Tokens**: Los refresh tokens se rotan de forma segura en cada uso y se invalidan en la base de datos para prevenir ataques de repetición.

## 📄 Licencia
Todos los derechos reservados.
