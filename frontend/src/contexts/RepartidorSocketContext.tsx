import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface RepartidorSocketContextType {
  socket: any;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
}

const RepartidorSocketContext = createContext<RepartidorSocketContextType | undefined>(undefined);

interface RepartidorSocketProviderProps {
  children: ReactNode;
}

export const RepartidorSocketProvider: React.FC<RepartidorSocketProviderProps> = ({ children }) => {
  const { socket, isConnected, emit, on, off } = useWebSocket({
    autoConnect: true,
  });

  // Unirse a la sala de repartidores cuando se conecte
  useEffect(() => {
    if (isConnected && socket) {
      console.log('[RepartidorSocket] ✅ Conectado - Uniéndose a sala de repartidores');
      socket.emit('join-repartidor');
    }
  }, [isConnected, socket]);

  const value: RepartidorSocketContextType = {
    socket,
    isConnected,
    emit,
    on,
    off,
  };

  return (
    <RepartidorSocketContext.Provider value={value}>
      {children}
    </RepartidorSocketContext.Provider>
  );
};

export const useRepartidorSocket = () => {
  const context = useContext(RepartidorSocketContext);
  if (context === undefined) {
    throw new Error('useRepartidorSocket must be used within a RepartidorSocketProvider');
  }
  return context;
};
