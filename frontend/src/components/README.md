# 📁 Arquitectura de Componentes - VITRINA

## 🗂️ Estructura Organizada por Funcionalidad

```
frontend/src/components/
├── auth/                    # 🔐 Autenticación y Autorización
│   ├── Login.tsx           # Formulario de inicio de sesión
│   ├── Register.tsx        # Formulario de registro
│   ├── VerificationModal.tsx # Modal de verificación de email
│   └── PrivateRoute.tsx    # Protección de rutas privadas
├── layout/                  # 🎨 Layout y Navegación
│   └── NavigationHeader.tsx # Header de navegación
├── dashboard/               # 📊 Sistema de Dashboards
│   ├── Dashboard.tsx       # Punto de entrada principal
│   ├── DashboardRouter.tsx # Router que decide qué dashboard mostrar
│   ├── CompanyMainDashboard.tsx # Dashboard principal para empresas
│   ├── ClientDashboard.tsx # Dashboard para clientes
│   ├── CompanyDashboard.tsx # Dashboard específico de empresa (vitrinas)
│   └── shared/             # 🔧 Componentes Compartidos
│       ├── DashboardHeader.tsx # Header común de dashboards
│       ├── MetricCard.tsx  # Tarjetas de métricas reutilizables
│       └── WelcomeSection.tsx # Sección de bienvenida
├── company/                 # 🏢 Funcionalidad de Empresas
│   └── CompanySelector.tsx # Selector de empresas
├── ui/                     # 🎨 Componentes de UI Reutilizables
│   └── (componentes futuros)
└── common/                 # 🔄 Componentes Comunes
    └── (componentes futuros)
```

## 🏗️ Arquitectura de Dashboards

### Flujo de Decisión

1. **Dashboard.tsx** → Punto de entrada simple
2. **DashboardRouter.tsx** → Analiza el tipo de usuario y decide:
   - Si es `empresa` → **CompanyMainDashboard.tsx**
   - Si es `cliente` → **ClientDashboard.tsx**

### Componentes Compartidos

#### 🔧 DashboardHeader
- Header común para todos los dashboards
- Navegación adaptativa según tipo de usuario
- Gestión de logout y debug

#### 📈 MetricCard
- Tarjetas de métricas reutilizables
- Soporte para tendencias (positiva/negativa/neutral)
- Diseño consistente y responsive

#### 👋 WelcomeSection
- Sección de bienvenida personalizada
- Acciones configurables por tipo de usuario
- Diseño atractivo con gradientes

## 🎯 Beneficios de la Nueva Arquitectura

### ✅ Separación de Responsabilidades
- Cada componente tiene una función específica
- Fácil mantenimiento y testing
- Código más limpio y organizado

### ✅ Reutilización de Código
- Componentes compartidos evitan duplicación
- Consistencia visual en toda la aplicación
- Fácil actualización de estilos globales

### ✅ Escalabilidad
- Estructura preparada para nuevas funcionalidades
- Fácil agregar nuevos tipos de dashboard
- Componentes modulares e independientes

### ✅ Mantenibilidad
- Archivos organizados por funcionalidad
- Imports más claros y específicos
- Fácil localización de código

## 🔄 Flujo de Autenticación y Dashboards

```
Usuario → Login → AuthContext → App Router → Dashboard → DashboardRouter
                                                              ↓
                                                    ¿Tipo de Usuario?
                                                    ↙              ↘
                                            Empresa                Cliente
                                               ↓                      ↓
                                    CompanyMainDashboard      ClientDashboard
                                               ↓                      ↓
                                    Componentes Compartidos ←--------┘
                                    (Header, Cards, Welcome)
```

## 🚀 Próximos Pasos

1. **Componentes UI Reutilizables**: Button, Modal, Card, etc.
2. **Error Boundaries**: Manejo de errores a nivel de componente
3. **Loading States**: Estados de carga unificados
4. **Animaciones**: Transiciones suaves entre estados
5. **Testing**: Tests unitarios para cada componente

## 📝 Convenciones de Código

- **Nombres**: PascalCase para componentes, camelCase para funciones
- **Archivos**: Un componente por archivo, mismo nombre que el componente
- **Estilos**: CSS modules o archivos .css separados por componente
- **Imports**: Imports relativos para componentes locales, absolutos para externos
- **Props**: Interfaces TypeScript para todas las props

---

*Esta arquitectura está diseñada para crecer con el proyecto y mantener la calidad del código a largo plazo.*
