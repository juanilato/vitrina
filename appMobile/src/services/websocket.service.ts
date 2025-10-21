/**
 * WebSocket Service
 * Servicio para manejar conexión en tiempo real con Socket.io
 */

import { io, Socket } from 'socket.io-client';
import { API_URL } from '../utils/constants';

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  /**
   * Conectar al servidor WebSocket
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('Connecting to WebSocket...');

    this.socket = io(API_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
    });
  }

  /**
   * Desconectar del servidor WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting from WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Verificar si está conectado
   */
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Escuchar evento de pedido actualizado
   */
  onOrderUpdated(callback: (data: any) => void): void {
    this.socket?.on('pedido-actualizado', callback);
  }

  /**
   * Escuchar evento de nuevo mensaje
   */
  onNewMessage(callback: (data: any) => void): void {
    this.socket?.on('nuevo-mensaje', callback);
  }

  /**
   * Escuchar evento de nueva notificación
   */
  onNewNotification(callback: (data: any) => void): void {
    this.socket?.on('nueva-notificacion', callback);
  }

  /**
   * Remover listener de pedido actualizado
   */
  offOrderUpdated(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('pedido-actualizado', callback);
    } else {
      this.socket?.off('pedido-actualizado');
    }
  }

  /**
   * Remover listener de nuevo mensaje
   */
  offNewMessage(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('nuevo-mensaje', callback);
    } else {
      this.socket?.off('nuevo-mensaje');
    }
  }

  /**
   * Remover listener de nueva notificación
   */
  offNewNotification(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('nueva-notificacion', callback);
    } else {
      this.socket?.off('nueva-notificacion');
    }
  }

  /**
   * Emitir evento personalizado
   */
  emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }

  /**
   * Escuchar evento personalizado
   */
  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  /**
   * Remover listener de evento personalizado
   */
  off(event: string, callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
