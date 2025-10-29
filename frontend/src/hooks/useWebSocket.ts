import { useEffect, useRef, useCallback, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const { autoConnect = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Evitar múltiples inicializaciones
    if (!autoConnect || hasInitialized.current) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('[WebSocket] No hay token disponible');
      return;
    }

    hasInitialized.current = true;
    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:3001';

    console.log('[WebSocket] Inicializando conexión...');

    const socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WebSocket] ✅ Conectado exitosamente');
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[WebSocket] ⚠️ Desconectado:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] ❌ Error de conexión:', error.message);
    });

    return () => {
      console.log('[WebSocket] Limpiando conexión...');
      if (socket && socket.connected) {
        socket.disconnect();
      }
      socketRef.current = null;
      hasInitialized.current = false;
    };
  }, [autoConnect]);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('[WebSocket] No conectado, no se puede emitir:', event);
    }
  }, []);

  // Usar useCallback sin dependencias para que las referencias sean estables
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      console.log(`[WebSocket] 📡 Registrando listener para evento: ${event}`);
      socketRef.current.on(event, (...args: any[]) => {
        console.log(`[WebSocket] 📨 Evento recibido: ${event}`, args);
        handler(...args);
      });
    } else {
      console.warn(`[WebSocket] ⚠️ No se pudo registrar listener para ${event}: socket no disponible`);
    }
  }, []);

  const off = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      console.log(`[WebSocket] 🚫 Removiendo listener para evento: ${event}`);
      socketRef.current.off(event, handler);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  };
};
