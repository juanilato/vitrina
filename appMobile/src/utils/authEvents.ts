/**
 * Auth Events
 * Sistema de eventos para comunicar cambios de autenticación
 * entre axios interceptor y AuthContext
 */

type AuthEventCallback = () => void;

class AuthEventEmitter {
  private listeners: AuthEventCallback[] = [];

  /**
   * Suscribirse al evento de logout forzado
   */
  subscribe(callback: AuthEventCallback): () => void {
    this.listeners.push(callback);

    // Retornar función para desuscribirse
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Emitir evento de logout forzado (token inválido/expirado)
   */
  emitForceLogout(): void {
    console.log('🔴 [AuthEvents] Emitiendo evento de logout forzado');
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error en listener de auth event:', error);
      }
    });
  }
}

export const authEvents = new AuthEventEmitter();
