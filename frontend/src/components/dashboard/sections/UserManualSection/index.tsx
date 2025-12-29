import React, { useState } from 'react';
import './UserManualSection.css';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const UserManualSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inicio' | 'productos' | 'pedidos' | 'envios' | 'configuracion' | 'tips'>('inicio');

  return (
    <div className="user-manual-container">
      <div className="manual-header">
        <div className="manual-header-icon">
          <HelpOutlineIcon style={{ fontSize: 40 }} />
        </div>
        <div>
          <h1 className="manual-title">Manual de Usuario - Vitrina</h1>
          <p className="manual-subtitle">Guía completa para configurar y usar tu plataforma de gestión</p>
        </div>
      </div>

      <div className="manual-tabs">
        <button
          className={`manual-tab ${activeTab === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveTab('inicio')}
        >
          <RocketLaunchIcon fontSize="small" />
          Primeros Pasos
        </button>
        <button
          className={`manual-tab ${activeTab === 'configuracion' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuracion')}
        >
          <SettingsIcon fontSize="small" />
          Configuración Inicial
        </button>
        <button
          className={`manual-tab ${activeTab === 'productos' ? 'active' : ''}`}
          onClick={() => setActiveTab('productos')}
        >
          <ShoppingBagIcon fontSize="small" />
          Gestión de Productos
        </button>
        <button
          className={`manual-tab ${activeTab === 'pedidos' ? 'active' : ''}`}
          onClick={() => setActiveTab('pedidos')}
        >
          <NotificationsActiveIcon fontSize="small" />
          Gestión de Pedidos
        </button>
        <button
          className={`manual-tab ${activeTab === 'envios' ? 'active' : ''}`}
          onClick={() => setActiveTab('envios')}
        >
          <DeliveryDiningIcon fontSize="small" />
          Envíos y Repartidores
        </button>
        <button
          className={`manual-tab ${activeTab === 'tips' ? 'active' : ''}`}
          onClick={() => setActiveTab('tips')}
        >
          <BarChartIcon fontSize="small" />
          Tips y Buenas Prácticas
        </button>
      </div>

      <div className="manual-content">
        {activeTab === 'inicio' && (
          <div className="manual-section">
            <h2 className="section-title">
              <RocketLaunchIcon /> Bienvenido a Vitrina
            </h2>
            <p className="section-intro">
              Vitrina es tu plataforma integral para gestionar tu negocio gastronómico. Desde la creación de productos
              hasta la gestión de pedidos y repartidores, todo en un solo lugar.
            </p>

            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Completa tu Perfil de Empresa</h3>
                <p>Ve a <strong>Configuración</strong> → <strong>Perfil</strong></p>
                <ul>
                  <li>Nombre de tu empresa</li>
                  <li>Logo y foto de portada</li>
                  <li>Información de contacto (teléfono, email, redes sociales)</li>
                  <li>Dirección física del local</li>
                </ul>
                <div className="tip-box">
                  <strong>💡 Tip:</strong> Un perfil completo genera más confianza en tus clientes.
                </div>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Configura tus Horarios de Atención</h3>
                <p>Ve a <strong>Configuración</strong> → <strong>Preferencias</strong></p>
                <ul>
                  <li>Define los días y horarios en que recibirás pedidos</li>
                  <li>Establece horarios especiales para días festivos</li>
                  <li>Activa/desactiva la recepción de pedidos según disponibilidad</li>
                </ul>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Crea tus Categorías de Productos</h3>
                <p>Ve a <strong>Configuración</strong> → <strong>Categorías</strong></p>
                <ul>
                  <li>Organiza tu menú en categorías (Ej: Pizzas, Bebidas, Postres)</li>
                  <li>Personaliza el orden de visualización</li>
                  <li>Asigna iconos o emojis para cada categoría</li>
                </ul>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Agrega tus Productos</h3>
                <p>Ve a <strong>Productos</strong> y comienza a cargar tu menú</p>
                <ul>
                  <li>Nombre, descripción y precio de cada producto</li>
                  <li>Fotos de alta calidad</li>
                  <li>Ingredientes y opciones de personalización</li>
                  <li>Control de stock (opcional)</li>
                </ul>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3>Configura tus Métodos de Envío</h3>
                <p>Ve a <strong>Configuración</strong> → <strong>Precios de Envío</strong></p>
                <ul>
                  <li>Define zonas de envío en el mapa</li>
                  <li>Establece precios por zona</li>
                  <li>Configura retiro en local (opcional)</li>
                </ul>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">6</div>
              <div className="step-content">
                <h3>Agrega Repartidores (Opcional)</h3>
                <p>Ve a <strong>Configuración</strong> → <strong>Repartidores</strong></p>
                <ul>
                  <li>Invita a tus repartidores por email</li>
                  <li>Asigna permisos y áreas de cobertura</li>
                  <li>Gestiona disponibilidad</li>
                </ul>
              </div>
            </div>

            <div className="success-box">
              <CheckCircleIcon style={{ fontSize: 32, color: '#4caf50' }} />
              <div>
                <h3>¡Listo para Empezar!</h3>
                <p>Una vez completados estos pasos, tu catálogo estará disponible y podrás comenzar a recibir pedidos.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'configuracion' && (
          <div className="manual-section">
            <h2 className="section-title">
              <SettingsIcon /> Configuración Inicial
            </h2>

            <div className="config-category">
              <h3 className="config-category-title">Perfil de Empresa</h3>
              <div className="config-item">
                <h4>Información Básica</h4>
                <ul>
                  <li><strong>Nombre:</strong> El nombre comercial de tu negocio (visible para clientes)</li>
                  <li><strong>Alias:</strong> URL personalizada para tu catálogo (ej: vitrina.com/tu-alias)</li>
                  <li><strong>Email:</strong> Correo de contacto principal</li>
                  <li><strong>Teléfono:</strong> Número de WhatsApp preferiblemente (para contacto directo)</li>
                  <li><strong>Descripción:</strong> Breve presentación de tu negocio</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Imágenes</h4>
                <ul>
                  <li><strong>Logo:</strong> Imagen cuadrada, mínimo 200x200px, formato PNG/JPG</li>
                  <li><strong>Portada:</strong> Imagen rectangular, mínimo 1200x400px</li>
                  <li>Usa imágenes de alta calidad que representen tu marca</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Ubicación</h4>
                <ul>
                  <li>Busca tu dirección en el mapa interactivo</li>
                  <li>Marca la ubicación exacta de tu local</li>
                  <li>Esto ayuda a calcular distancias de envío</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Preferencias de Negocio</h3>
              <div className="config-item">
                <h4>Horarios de Atención</h4>
                <ul>
                  <li>Define horarios para cada día de la semana</li>
                  <li>Puedes tener diferentes horarios por día</li>
                  <li>Marca días cerrados cuando no operes</li>
                  <li>Los clientes solo podrán pedir en los horarios establecidos</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Configuración de Pedidos</h4>
                <ul>
                  <li><strong>Tiempo de preparación:</strong> Minutos estimados para preparar un pedido</li>
                  <li><strong>Pedido mínimo:</strong> Monto mínimo para aceptar pedidos</li>
                  <li><strong>Métodos de pago:</strong> Efectivo, transferencia, MercadoPago, etc.</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Personalización Visual</h4>
                <ul>
                  <li><strong>Color primario:</strong> Color de tu marca (usado en botones y detalles)</li>
                  <li><strong>Color secundario:</strong> Color complementario</li>
                  <li><strong>Tema:</strong> Claro u oscuro</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Categorías de Productos</h3>
              <div className="config-item">
                <h4>Crear Categorías</h4>
                <ul>
                  <li>Haz clic en "Nueva Categoría"</li>
                  <li>Asigna un nombre descriptivo</li>
                  <li>Elige un emoji o icono representativo</li>
                  <li>Define el orden de visualización</li>
                </ul>
                <p className="example-text">
                  <strong>Ejemplos:</strong> 🍕 Pizzas, 🍔 Hamburguesas, 🥤 Bebidas, 🍰 Postres
                </p>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Precios de Envío</h3>
              <div className="config-item">
                <h4>Configurar Zonas de Envío</h4>
                <ol>
                  <li>Haz clic en "Agregar Zona"</li>
                  <li>Dibuja el área de cobertura en el mapa</li>
                  <li>Define el precio de envío para esa zona</li>
                  <li>Guarda los cambios</li>
                </ol>
                <div className="tip-box">
                  <strong>💡 Tip:</strong> Puedes crear múltiples zonas con diferentes precios según la distancia.
                </div>
              </div>

              <div className="config-item">
                <h4>Retiro en Local</h4>
                <ul>
                  <li>Activa la opción "Permitir retiro en local"</li>
                  <li>Los clientes podrán elegir retirar su pedido sin costo de envío</li>
                  <li>Puedes ofrecer descuentos para retiros</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Repartidores</h3>
              <div className="config-item">
                <h4>Agregar Repartidores</h4>
                <ol>
                  <li>Ve a la pestaña "Repartidores"</li>
                  <li>Haz clic en "Invitar Repartidor"</li>
                  <li>Ingresa el email del repartidor</li>
                  <li>El repartidor recibirá una invitación para registrarse</li>
                  <li>Una vez registrado, aparecerá en tu lista</li>
                </ol>
              </div>

              <div className="config-item">
                <h4>Gestionar Repartidores</h4>
                <ul>
                  <li>Ver estado (disponible/ocupado)</li>
                  <li>Asignar/desasignar pedidos</li>
                  <li>Ver historial de entregas</li>
                  <li>Activar/desactivar repartidores</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Suscripción</h3>
              <div className="config-item">
                <h4>Planes Disponibles</h4>
                <ul>
                  <li><strong>Plan Gratuito:</strong> Funcionalidades básicas, ideal para probar</li>
                  <li><strong>Plan Premium:</strong> Sin límites, todas las funcionalidades</li>
                  <li><strong>Plan Enterprise:</strong> Para negocios grandes, soporte prioritario</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Gestionar Suscripción</h4>
                <ul>
                  <li>Ve a "Configuración" → "Suscripción"</li>
                  <li>Revisa tu plan actual y límites</li>
                  <li>Actualiza o cancela tu plan cuando lo necesites</li>
                  <li>Pagos seguros a través de MercadoPago</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'productos' && (
          <div className="manual-section">
            <h2 className="section-title">
              <ShoppingBagIcon /> Gestión de Productos
            </h2>

            <div className="config-category">
              <h3 className="config-category-title">Crear un Producto</h3>
              <div className="config-item">
                <h4>Información Básica</h4>
                <ol>
                  <li>Ve a la sección "Productos"</li>
                  <li>Haz clic en "Nuevo Producto"</li>
                  <li>Completa los campos:
                    <ul>
                      <li><strong>Nombre:</strong> Nombre atractivo y descriptivo</li>
                      <li><strong>Descripción:</strong> Detalla ingredientes, preparación, etc.</li>
                      <li><strong>Precio:</strong> Precio base del producto</li>
                      <li><strong>Categoría:</strong> Selecciona la categoría correspondiente</li>
                    </ul>
                  </li>
                  <li>Haz clic en "Guardar"</li>
                </ol>
              </div>

              <div className="config-item">
                <h4>Agregar Imágenes</h4>
                <ul>
                  <li>Haz clic en "Subir Imagen"</li>
                  <li>Selecciona una foto de alta calidad del producto</li>
                  <li>Formato recomendado: JPG/PNG, mínimo 800x800px</li>
                  <li>Puedes agregar múltiples imágenes</li>
                  <li>La primera imagen será la principal</li>
                </ul>
                <div className="tip-box">
                  <strong>📸 Tip:</strong> Usa fotos con buena iluminación y fondo limpio. Las fotos reales venden más que las de stock.
                </div>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Ingredientes y Variantes</h3>
              <div className="config-item">
                <h4>Agregar Ingredientes Base</h4>
                <ol>
                  <li>Dentro del modal de producto, ve a "Ingredientes"</li>
                  <li>Haz clic en "Agregar Ingrediente"</li>
                  <li>Selecciona ingredientes de tu lista o crea nuevos</li>
                  <li>Marca ingredientes como "removibles" si el cliente puede quitarlos</li>
                </ol>
              </div>

              <div className="config-item">
                <h4>Crear Ingredientes Adicionales</h4>
                <ul>
                  <li>Define ingredientes extras que el cliente puede agregar</li>
                  <li>Asigna un precio adicional a cada extra</li>
                  <li>Ejemplo: Extra queso (+$50), Doble carne (+$100)</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Variantes del Producto</h4>
                <p>Crea variantes para ofrecer opciones (tamaños, sabores, etc.)</p>
                <ul>
                  <li><strong>Nombre de la variante:</strong> Ej: "Tamaño", "Sabor"</li>
                  <li><strong>Opciones:</strong> Ej: Chica, Mediana, Grande</li>
                  <li><strong>Precios:</strong> Asigna precio diferencial a cada opción</li>
                  <li><strong>Por defecto:</strong> Marca la opción predeterminada</li>
                </ul>
                <p className="example-text">
                  <strong>Ejemplo:</strong> Pizza - Tamaño: Chica ($800), Mediana ($1200), Grande ($1500)
                </p>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Gestión de Stock</h3>
              <div className="config-item">
                <h4>Activar Control de Stock</h4>
                <ul>
                  <li>En el modal de producto, activa "Controlar Stock"</li>
                  <li>Define la cantidad disponible</li>
                  <li>El sistema descontará automáticamente con cada venta</li>
                  <li>Recibirás alertas cuando el stock sea bajo</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Productos Agotados</h4>
                <ul>
                  <li>Puedes marcar productos como "No disponible" temporalmente</li>
                  <li>Los clientes verán el producto pero no podrán pedirlo</li>
                  <li>Reactiva cuando vuelvas a tener stock</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Promociones y Descuentos</h3>
              <div className="config-item">
                <h4>Crear Promociones</h4>
                <ol>
                  <li>Haz clic en "Promociones" en la sección de productos</li>
                  <li>Define el tipo de promoción:
                    <ul>
                      <li>Descuento porcentual (Ej: 20% OFF)</li>
                      <li>Descuento fijo (Ej: $100 menos)</li>
                      <li>2x1 o 3x2</li>
                      <li>Combo especial</li>
                    </ul>
                  </li>
                  <li>Selecciona productos incluidos</li>
                  <li>Define vigencia (fechas de inicio y fin)</li>
                  <li>Activa/desactiva según necesites</li>
                </ol>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Buenas Prácticas</h3>
              <div className="tip-box">
                <strong>✅ Consejos para tus productos:</strong>
                <ul>
                  <li>Usa nombres atractivos y descriptivos</li>
                  <li>Incluye fotos reales y de alta calidad</li>
                  <li>Describe ingredientes y alérgenos</li>
                  <li>Mantén precios actualizados</li>
                  <li>Organiza por categorías lógicas</li>
                  <li>Destaca tus productos estrella</li>
                  <li>Actualiza el stock regularmente</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pedidos' && (
          <div className="manual-section">
            <h2 className="section-title">
              <NotificationsActiveIcon /> Gestión de Pedidos
            </h2>

            <div className="config-category">
              <h3 className="config-category-title">Flujo de Pedidos</h3>
              <div className="config-item">
                <h4>Estados de un Pedido</h4>
                <ol>
                  <li><strong>Pendiente:</strong> Pedido recién recibido, esperando confirmación</li>
                  <li><strong>Confirmado:</strong> Aceptaste el pedido, comenzando preparación</li>
                  <li><strong>En Preparación:</strong> Estás preparando el pedido</li>
                  <li><strong>Listo para Envío:</strong> Pedido preparado, esperando repartidor</li>
                  <li><strong>En Camino:</strong> Repartidor en ruta hacia el cliente</li>
                  <li><strong>Entregado:</strong> Pedido entregado exitosamente</li>
                  <li><strong>Cancelado:</strong> Pedido cancelado por ti o el cliente</li>
                </ol>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Recibir y Confirmar Pedidos</h3>
              <div className="config-item">
                <h4>Notificaciones</h4>
                <ul>
                  <li>Recibirás una notificación en tiempo real</li>
                  <li>Sonido de alerta (si tienes activado)</li>
                  <li>Notificación de escritorio (si otorgaste permisos)</li>
                  <li>Badge en el icono de pedidos</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Revisar el Pedido</h4>
                <ol>
                  <li>Ve a la sección "Pedidos"</li>
                  <li>Haz clic en el pedido nuevo</li>
                  <li>Revisa:
                    <ul>
                      <li>Productos solicitados</li>
                      <li>Personalizaciones e ingredientes</li>
                      <li>Dirección de entrega</li>
                      <li>Método de pago</li>
                      <li>Total a cobrar</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="config-item">
                <h4>Confirmar o Rechazar</h4>
                <ul>
                  <li><strong>Confirmar:</strong> Acepta el pedido y comienza preparación</li>
                  <li><strong>Rechazar:</strong> Si no puedes atenderlo (stock, horario, zona)</li>
                  <li>Al rechazar, especifica el motivo para el cliente</li>
                </ul>
                <div className="warning-box">
                  <strong>⚠️ Importante:</strong> Confirma o rechaza rápidamente. Los clientes esperan respuesta en menos de 5 minutos.
                </div>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Preparación y Envío</h3>
              <div className="config-item">
                <h4>Marcar como "En Preparación"</h4>
                <ul>
                  <li>Una vez confirmado, el estado cambia automáticamente</li>
                  <li>El cliente recibe notificación de que estás preparando</li>
                  <li>Puedes ver tiempo estimado de preparación</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Asignar Repartidor</h4>
                <ol>
                  <li>Cuando el pedido esté listo, haz clic en "Asignar Repartidor"</li>
                  <li>Selecciona un repartidor disponible</li>
                  <li>El repartidor recibe notificación con detalles del pedido</li>
                  <li>El estado cambia a "En Camino" cuando el repartidor acepta</li>
                </ol>
              </div>

              <div className="config-item">
                <h4>Seguimiento de Entrega</h4>
                <ul>
                  <li>Puedes ver la ubicación del repartidor en tiempo real</li>
                  <li>El cliente también puede hacer seguimiento</li>
                  <li>Tiempo estimado de llegada actualizado</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Finalización de Pedidos</h3>
              <div className="config-item">
                <h4>Marcar como Entregado</h4>
                <ul>
                  <li>El repartidor marca como "Entregado" desde su app</li>
                  <li>Confirma el método de pago utilizado</li>
                  <li>El pedido se archiva en "Completados"</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Cancelaciones</h4>
                <ul>
                  <li>Puedes cancelar un pedido hasta que esté "En Camino"</li>
                  <li>Especifica el motivo de cancelación</li>
                  <li>El cliente recibe notificación inmediata</li>
                  <li>Si ya pagó, se gestiona el reembolso</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Pedidos Presenciales</h3>
              <div className="config-item">
                <h4>Toma de Pedidos en Local</h4>
                <ol>
                  <li>Ve a "Toma de Pedidos" en el dashboard</li>
                  <li>Crea un nuevo pedido manualmente</li>
                  <li>Selecciona productos del catálogo</li>
                  <li>Define si es para llevar o en el local</li>
                  <li>Registra el pago</li>
                  <li>Imprime ticket (si tienes impresora conectada)</li>
                </ol>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Historial y Reportes</h3>
              <div className="config-item">
                <h4>Ver Historial de Pedidos</h4>
                <ul>
                  <li>Accede a todos tus pedidos históricos</li>
                  <li>Filtra por fecha, estado, cliente</li>
                  <li>Busca pedidos específicos</li>
                  <li>Exporta datos para contabilidad</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Estadísticas</h4>
                <ul>
                  <li>Ve a "Estadísticas" para ver métricas</li>
                  <li>Productos más vendidos</li>
                  <li>Ingresos por período</li>
                  <li>Horarios de mayor demanda</li>
                  <li>Zonas de entrega más frecuentes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'envios' && (
          <div className="manual-section">
            <h2 className="section-title">
              <DeliveryDiningIcon /> Envíos y Repartidores
            </h2>

            <div className="config-category">
              <h3 className="config-category-title">Configuración de Zonas de Envío</h3>
              <div className="config-item">
                <h4>Crear Zonas de Cobertura</h4>
                <ol>
                  <li>Ve a Configuración → Precios de Envío</li>
                  <li>Haz clic en "Agregar Zona"</li>
                  <li>Dibuja el polígono en el mapa:
                    <ul>
                      <li>Haz clic para marcar puntos del perímetro</li>
                      <li>Cierra el polígono haciendo clic en el primer punto</li>
                    </ul>
                  </li>
                  <li>Asigna un nombre a la zona (Ej: "Centro", "Zona Norte")</li>
                  <li>Define el precio de envío</li>
                  <li>Guarda los cambios</li>
                </ol>
              </div>

              <div className="config-item">
                <h4>Gestionar Zonas Existentes</h4>
                <ul>
                  <li>Edita zonas para cambiar precios o área</li>
                  <li>Elimina zonas que ya no cubras</li>
                  <li>Puedes superponer zonas (prevalece la más específica)</li>
                </ul>
                <div className="tip-box">
                  <strong>💡 Tip:</strong> Empieza con pocas zonas y expande gradualmente según demanda.
                </div>
              </div>

              <div className="config-item">
                <h4>Retiro en Local</h4>
                <ul>
                  <li>Activa "Permitir retiro en local"</li>
                  <li>Los clientes pueden optar por retirar sin costo</li>
                  <li>Define un horario específico para retiros (si es diferente)</li>
                  <li>Puedes ofrecer un descuento para incentivar retiros</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Gestión de Repartidores</h3>
              <div className="config-item">
                <h4>Agregar Repartidores</h4>
                <ol>
                  <li>Ve a Configuración → Repartidores</li>
                  <li>Haz clic en "Invitar Repartidor"</li>
                  <li>Ingresa el email del repartidor</li>
                  <li>El repartidor recibe un email de invitación</li>
                  <li>Debe registrarse con ese email</li>
                  <li>Una vez registrado, aparece en tu lista</li>
                </ol>
              </div>

              <div className="config-item">
                <h4>Permisos y Configuración</h4>
                <ul>
                  <li><strong>Zonas asignadas:</strong> Limita a qué zonas puede acceder</li>
                  <li><strong>Horarios:</strong> Define disponibilidad del repartidor</li>
                  <li><strong>Estado:</strong> Activo/Inactivo/Suspendido</li>
                  <li><strong>Comisión:</strong> Define porcentaje o monto fijo por entrega</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Asignación de Pedidos</h4>
                <p>Tienes dos modos de asignación:</p>
                <ul>
                  <li><strong>Manual:</strong> Tú eliges qué repartidor lleva cada pedido</li>
                  <li><strong>Automática:</strong> El sistema asigna al repartidor más cercano y disponible</li>
                </ul>
                <p>Para asignación manual:</p>
                <ol>
                  <li>En el pedido, haz clic en "Asignar Repartidor"</li>
                  <li>Selecciona de la lista de disponibles</li>
                  <li>El repartidor recibe notificación</li>
                  <li>Puede aceptar o rechazar (si rechaza, debes reasignar)</li>
                </ol>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Seguimiento de Entregas</h3>
              <div className="config-item">
                <h4>Tracking en Tiempo Real</h4>
                <ul>
                  <li>Ve la ubicación del repartidor en el mapa</li>
                  <li>Tiempo estimado de llegada</li>
                  <li>Distancia recorrida</li>
                  <li>Historial de ubicaciones</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Comunicación</h4>
                <ul>
                  <li>Chatea con el repartidor desde el panel</li>
                  <li>Recibe notificaciones de cambios de estado</li>
                  <li>El cliente también puede contactar al repartidor</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Reportes de Repartidores</h3>
              <div className="config-item">
                <h4>Métricas Individuales</h4>
                <ul>
                  <li>Cantidad de entregas por período</li>
                  <li>Tiempo promedio de entrega</li>
                  <li>Calificaciones de clientes</li>
                  <li>Comisiones generadas</li>
                  <li>Zonas más frecuentes</li>
                </ul>
              </div>

              <div className="config-item">
                <h4>Pagos y Liquidaciones</h4>
                <ul>
                  <li>Revisa comisiones acumuladas</li>
                  <li>Genera reportes de liquidación</li>
                  <li>Exporta datos para pagos</li>
                  <li>Historial de pagos realizados</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Sin Repartidores Propios</h3>
              <div className="config-item">
                <h4>Opciones Alternativas</h4>
                <p>Si no tienes repartidores, puedes:</p>
                <ul>
                  <li><strong>Solo Retiro:</strong> Ofrece únicamente retiro en local</li>
                  <li><strong>Servicios Externos:</strong> Integra con Rappi, Glovo, PedidosYa</li>
                  <li><strong>Cliente Responsable:</strong> El cliente coordina su propio envío</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="manual-section">
            <h2 className="section-title">
              <BarChartIcon /> Tips y Buenas Prácticas
            </h2>

            <div className="config-category">
              <h3 className="config-category-title">Optimización del Catálogo</h3>
              <div className="tip-box success">
                <strong>✅ Fotografía de Productos</strong>
                <ul>
                  <li>Usa luz natural cuando sea posible</li>
                  <li>Fondo limpio y uniforme (blanco o neutro)</li>
                  <li>Muestra el producto desde varios ángulos</li>
                  <li>Incluye referencias de tamaño</li>
                  <li>Evita filtros excesivos que distorsionen colores</li>
                  <li>Actualiza fotos de productos de temporada</li>
                </ul>
              </div>

              <div className="tip-box success">
                <strong>✅ Descripciones Efectivas</strong>
                <ul>
                  <li>Sé específico con ingredientes y preparación</li>
                  <li>Menciona alérgenos comunes</li>
                  <li>Usa adjetivos que despierten el apetito</li>
                  <li>Destaca lo que hace único a tu producto</li>
                  <li>Incluye peso/tamaño cuando sea relevante</li>
                </ul>
                <p className="example-text">
                  <strong>Ejemplo:</strong> "Pizza artesanal con masa madre de 48hs de fermentación, salsa de tomate fresco,
                  mozzarella de búfala y albahaca orgánica. Horneada en horno de piedra a 400°C."
                </p>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Gestión de Pedidos Eficiente</h3>
              <div className="tip-box success">
                <strong>✅ Tiempos de Respuesta</strong>
                <ul>
                  <li>Confirma pedidos en menos de 5 minutos</li>
                  <li>Si te demorás, envía un mensaje al cliente</li>
                  <li>Sé realista con tiempos de preparación</li>
                  <li>Mejor sobre-estimar que generar expectativas falsas</li>
                </ul>
              </div>

              <div className="tip-box success">
                <strong>✅ Comunicación Proactiva</strong>
                <ul>
                  <li>Avisa si hay demoras</li>
                  <li>Notifica cambios de estado del pedido</li>
                  <li>Si falta un ingrediente, ofrece alternativas</li>
                  <li>Confirma direcciones dudosas antes de enviar</li>
                </ul>
              </div>

              <div className="tip-box success">
                <strong>✅ Organización Interna</strong>
                <ul>
                  <li>Prepara ingredientes con anticipación en horarios pico</li>
                  <li>Usa el sistema de prioridades del dashboard</li>
                  <li>Marca pedidos urgentes claramente</li>
                  <li>Ten un sistema de ticket de cocina</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Maximizar Ventas</h3>
              <div className="tip-box success">
                <strong>✅ Estrategias de Precios</strong>
                <ul>
                  <li>Ofrece combos y promociones</li>
                  <li>Precio sugerido para upselling (bebidas, postres)</li>
                  <li>Descuentos por volumen (lleva 2, paga 1.5)</li>
                  <li>Happy hours o promociones por horario</li>
                  <li>Programa de fidelización para clientes frecuentes</li>
                </ul>
              </div>

              <div className="tip-box success">
                <strong>✅ Cross-selling</strong>
                <ul>
                  <li>Sugiere complementos al agregar al carrito</li>
                  <li>Crea categorías "Recomendados" o "Lo más pedido"</li>
                  <li>Destaca productos de temporada</li>
                  <li>Ofrece extras personalizables</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Atención al Cliente</h3>
              <div className="tip-box success">
                <strong>✅ Calidad de Servicio</strong>
                <ul>
                  <li>Responde mensajes rápidamente</li>
                  <li>Sé cortés incluso ante reclamos</li>
                  <li>Resuelve problemas con compensaciones (descuentos, productos gratis)</li>
                  <li>Pide feedback y actúa en consecuencia</li>
                  <li>Agradece a clientes frecuentes</li>
                </ul>
              </div>

              <div className="tip-box success">
                <strong>✅ Manejo de Quejas</strong>
                <ul>
                  <li>Escucha primero, no te defiendas de inmediato</li>
                  <li>Disculpate sinceramente</li>
                  <li>Ofrece solución concreta</li>
                  <li>Haz seguimiento para asegurar satisfacción</li>
                  <li>Aprende de cada error</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Uso de Estadísticas</h3>
              <div className="tip-box success">
                <strong>✅ Análisis de Datos</strong>
                <ul>
                  <li>Revisa productos más vendidos semanalmente</li>
                  <li>Identifica horarios pico y ajusta personal</li>
                  <li>Analiza productos con baja rotación</li>
                  <li>Estudia zonas de mayor demanda para expansión</li>
                  <li>Compara períodos para detectar tendencias</li>
                </ul>
              </div>

              <div className="tip-box success">
                <strong>✅ Toma de Decisiones</strong>
                <ul>
                  <li>Elimina productos que no venden</li>
                  <li>Potencia tus best-sellers</li>
                  <li>Ajusta precios basándote en datos</li>
                  <li>Planifica promociones en horarios bajos</li>
                  <li>Expande zonas de entrega rentables</li>
                </ul>
              </div>
            </div>

            <div className="config-category">
              <h3 className="config-category-title">Marketing Digital</h3>
              <div className="tip-box success">
                <strong>✅ Presencia Online</strong>
                <ul>
                  <li>Comparte tu link de catálogo en redes sociales</li>
                  <li>Publica fotos de productos regularmente</li>
                  <li>Interactúa con comentarios y mensajes</li>
                  <li>Ofrece promociones exclusivas por redes</li>
                  <li>Usa hashtags locales para visibilidad</li>
                </ul>
              </div>

              <div className="tip-box success">
                <strong>✅ Código QR</strong>
                <ul>
                  <li>Genera tu QR desde Configuración</li>
                  <li>Imprímelo en material físico (volantes, carteles)</li>
                  <li>Colócalo en tu local</li>
                  <li>Incluye en packaging de entregas</li>
                  <li>Facilita que clientes compartan tu catálogo</li>
                </ul>
              </div>
            </div>

            <div className="warning-box">
              <strong>⚠️ Errores Comunes a Evitar</strong>
              <ul>
                <li>❌ No actualizar stock y ofrecer productos agotados</li>
                <li>❌ Fotos de baja calidad o que no representan el producto</li>
                <li>❌ Tiempos de entrega irreales</li>
                <li>❌ No responder mensajes de clientes</li>
                <li>❌ Precios desactualizados o con errores</li>
                <li>❌ No usar las estadísticas para mejorar</li>
                <li>❌ Descuidar la presentación del catálogo</li>
              </ul>
            </div>

            <div className="success-box">
              <CheckCircleIcon style={{ fontSize: 32, color: '#4caf50' }} />
              <div>
                <h3>Recuerda</h3>
                <p>El éxito viene de la consistencia. Aplica estos consejos gradualmente y mide resultados.
                Escucha a tus clientes y adapta tu estrategia. ¡Mucho éxito con tu negocio!</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="manual-footer">
        <div className="footer-section">
          <h4>¿Necesitas ayuda adicional?</h4>
          <p>Contacta a nuestro soporte:</p>
          <ul>
            <li>📧 Email: soporte@vitrina.com</li>
            <li>💬 WhatsApp: +54 9 XXX XXX-XXXX</li>
            <li>📚 Centro de ayuda: ayuda.vitrina.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserManualSection;
