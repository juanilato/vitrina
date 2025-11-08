/**
 * Hook para WebSocket en React Native
 * Proporciona conexión en tiempo real con el backend
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API_URL } from '../utils/constants';

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
    if (!autoConnect || hasInitialized.current) return;

    const initSocket = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
          console.log('[WebSocket] No hay token disponible');
          return;
        }

        hasInitialized.current = true;
        console.log('[WebSocket] Inicializando conexión a:', API_URL);
        console.log('[WebSocket] Token presente:', !!token);

        const socket = io(API_URL, {
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

          // IMPORTANTE: Unirse al room de notificaciones
          console.log('[WebSocket] 📢 Joining notifications room...');
          socket.emit('join-notifications');
        });

        socket.on('disconnect', (reason) => {
          console.log('[WebSocket] ⚠️ Desconectado:', reason);
          setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
          console.error('[WebSocket] ❌ Error de conexión:', error.message);
        });
      } catch (error) {
        console.error('[WebSocket] Error al inicializar:', error);
      }
    };

    initSocket();

    return () => {
      console.log('[WebSocket] Limpiando conexión...');
      if (socketRef.current?.connected) {
        socketRef.current.disconnect();
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
